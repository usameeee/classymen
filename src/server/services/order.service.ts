import { OrderModel } from '../models/Order';
import { ProductModel } from '../models/Product';
import type { Locale } from '@shared/constants/locales';
import { DEFAULT_LOCALE } from '@shared/constants/locales';
import { DEFAULT_CURRENCY } from '@shared/constants/catalog';
import { pickLocalized } from '../utils/localized';
import { sendOrderConfirmation } from './email.service';
import { validateCoupon, applyCouponUsage } from './coupon.service';

/** Cart line sent from the browser. */
export interface IncomingLine {
  productId: string;
  size?: string;
  quantity: number;
  isGift?: boolean;
  giftMessage?: string;
}

/** Customer payload sent from the browser. */
export interface IncomingCustomer {
  name: string;
  phone: string;
  email?: string;
  city?: string;
  address?: string;
  notes?: string;
}

export interface CreateOrderPayload {
  customer: IncomingCustomer;
  lines: IncomingLine[];
  couponCode?: string;
  locale?: Locale;
}

/** Builds the pre-filled WhatsApp message text for an order. */
function buildWhatsAppMessage(
  orderNumber: string,
  customer: IncomingCustomer,
  lines: Array<{ name: string; size?: string; quantity: number; price: number; isGift?: boolean; giftMessage?: string }>,
  subtotal: number,
  discount: number,
  total: number,
  couponCode: string | undefined,
  currency: string,
  locale: Locale,
): string {
  const labels: Record<Locale, { order: string; name: string; size: string; subtotal: string; discount: string; total: string; gift: string; note: string }> = {
    ar: { order: 'طلبية', name: 'الاسم', size: 'المقاس', subtotal: 'المجموع الجزئي', discount: 'الخصم', total: 'المجموع النهائي', gift: '🎁 هدية', note: 'ملاحظات' },
    fr: { order: 'Commande', name: 'Nom', size: 'Taille', subtotal: 'Sous-total', discount: 'Remise', total: 'Total', gift: '🎁 Cadeau', note: 'Notes' },
    en: { order: 'Order', name: 'Name', size: 'Size', subtotal: 'Subtotal', discount: 'Discount', total: 'Total', gift: '🎁 Gift', note: 'Notes' },
  };
  const L = labels[locale] ?? labels.fr;
  const curr = currency === 'MRU' ? ' MRU' : ` ${currency}`;

  const header = `✨ Classy Men Rim — ${L.order} #${orderNumber}`;
  const customerLine = `${L.name}: ${customer.name} | 📞 ${customer.phone}`;
  const cityLine = customer.city ? `📍 ${customer.city}` : '';

  const itemLines = lines
    .map((line) => {
      const sizePart = line.size ? ` (${L.size} ${line.size})` : '';
      const giftPart = line.isGift ? ` — ${L.gift}${line.giftMessage ? `: "${line.giftMessage}"` : ''}` : '';
      return `• ${line.name}${sizePart} × ${line.quantity} — ${(line.price * line.quantity).toFixed(2)}${curr}${giftPart}`;
    })
    .join('\n');

  const subtotalLine = discount > 0 ? `${L.subtotal}: ${subtotal.toFixed(2)}${curr}` : '';
  const discountLine = discount > 0 ? `${L.discount} (${couponCode}): -${discount.toFixed(2)}${curr}` : '';
  const totalLine = `${L.total}: ${total.toFixed(2)}${curr}`;
  const noteLine = customer.notes ? `${L.note}: ${customer.notes}` : '';

  return [header, customerLine, cityLine, '', itemLines, '', subtotalLine, discountLine, totalLine, noteLine]
    .filter(Boolean)
    .join('\n');
}

/** Creates an order from a cart submission and returns the saved order + WhatsApp URL. */
export async function createOrder(payload: CreateOrderPayload, waNumber: string) {
  const locale: Locale = payload.locale ?? DEFAULT_LOCALE;

  if (!payload.lines?.length) {
    throw Object.assign(new Error('Cart is empty'), { status: 400 });
  }

  // Resolve products from DB to prevent price manipulation.
  const productIds = payload.lines.map((l) => l.productId);
  const products = await ProductModel.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const resolvedLines: Array<{
    name: string;
    size?: string;
    quantity: number;
    price: number;
    isGift?: boolean;
    giftMessage?: string;
  }> = [];
  const orderItems: Array<{ product: string; name: string; size?: string; price: number; quantity: number }> = [];

  for (const line of payload.lines) {
    const product = productMap.get(line.productId);
    if (!product) {
      throw Object.assign(new Error(`Product not found: ${line.productId}`), { status: 400 });
    }
    const qty = Math.max(1, Math.floor(line.quantity));
    const name = pickLocalized(product.name as Record<string, string>, locale);

    resolvedLines.push({
      name,
      size: line.size,
      quantity: qty,
      price: product.price,
      isGift: line.isGift,
      giftMessage: line.giftMessage,
    });

    orderItems.push({
      product: line.productId,
      name,
      size: line.size,
      price: product.price,
      quantity: qty,
    });
  }

  const subtotal = resolvedLines.reduce((acc, l) => acc + l.price * l.quantity, 0);
  const currency = products[0]?.currency ?? DEFAULT_CURRENCY;

  let discount = 0;
  let validatedCouponCode: string | undefined;

  if (payload.couponCode) {
    const couponRes = await validateCoupon(payload.couponCode, subtotal);
    if (couponRes.valid && couponRes.discountAmount > 0) {
      discount = couponRes.discountAmount;
      validatedCouponCode = couponRes.code;
      await applyCouponUsage(couponRes.code!);
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);

  const order = await OrderModel.create({
    customer: payload.customer,
    items: orderItems,
    subtotal,
    discount,
    coupon: validatedCouponCode ? { code: validatedCouponCode, discountAmount: discount } : undefined,
    total: finalTotal,
    currency,
    locale,
  });

  const message = buildWhatsAppMessage(
    order.orderNumber,
    payload.customer,
    resolvedLines,
    subtotal,
    discount,
    finalTotal,
    validatedCouponCode,
    currency,
    locale,
  );

  const whatsappUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`
    : null;

  // Fire-and-forget confirmation email (never blocks the response).
  void sendOrderConfirmation({
    orderNumber: order.orderNumber,
    customerName: payload.customer.name,
    customerEmail: payload.customer.email,
    lines: resolvedLines,
    subtotal,
    currency,
    locale,
  });

  return { order, whatsappUrl };
}

