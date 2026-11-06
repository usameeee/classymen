/**
 * Email service using Gmail SMTP (nodemailer).
 * Requires MAIL_USER and MAIL_APP_PASSWORD in the environment.
 * Silently skips sending when credentials are absent (dev without email config).
 */
import nodemailer from 'nodemailer';
import type { Locale } from '@shared/constants/locales';
import { DEFAULT_LOCALE } from '@shared/constants/locales';

function createTransport() {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  lines: Array<{ name: string; size?: string; quantity: number; price: number; isGift?: boolean }>;
  subtotal: number;
  currency: string;
  locale: Locale;
}

const LABEL: Record<Locale, {
  subject: string; greeting: string; thanks: string;
  orderRef: string; item: string; size: string; qty: string; price: string;
  total: string; gift: string; closing: string; brand: string;
}> = {
  ar: {
    subject: 'تأكيد طلبك — Classy Men Rim',
    greeting: 'عزيزي',
    thanks: 'شكراً لطلبك من Classy Men Rim. إليك ملخص طلبك:',
    orderRef: 'رقم الطلب',
    item: 'المنتج',
    size: 'المقاس',
    qty: 'الكمية',
    price: 'السعر',
    total: 'المجموع',
    gift: '🎁 هدية',
    closing: 'سيتواصل معك فريقنا قريباً عبر واتساب لتأكيد الطلب والترتيب للتوصيل.',
    brand: 'Classy Men Rim — موريتانيا',
  },
  fr: {
    subject: 'Confirmation de commande — Classy Men Rim',
    greeting: 'Cher(e)',
    thanks: 'Merci pour votre commande chez Classy Men Rim. Voici votre récapitulatif :',
    orderRef: 'Référence commande',
    item: 'Article',
    size: 'Taille',
    qty: 'Qté',
    price: 'Prix',
    total: 'Total',
    gift: '🎁 Cadeau',
    closing: 'Notre équipe vous contactera prochainement via WhatsApp pour confirmer votre commande.',
    brand: 'Classy Men Rim — Mauritanie',
  },
  en: {
    subject: 'Order Confirmation — Classy Men Rim',
    greeting: 'Dear',
    thanks: 'Thank you for your order at Classy Men Rim. Here is your order summary:',
    orderRef: 'Order reference',
    item: 'Item',
    size: 'Size',
    qty: 'Qty',
    price: 'Price',
    total: 'Total',
    gift: '🎁 Gift',
    closing: 'Our team will contact you shortly via WhatsApp to confirm your order.',
    brand: 'Classy Men Rim — Mauritania',
  },
};

function formatMoney(amount: number, currency: string) {
  return `${amount.toFixed(2)} ${currency}`;
}

function buildHtml(data: OrderEmailData): string {
  const L = LABEL[data.locale] ?? LABEL.fr;
  const rows = data.lines.map((l) => {
    const giftMark = l.isGift ? ` <span style="color:#b8973e">${L.gift}</span>` : '';
    return `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e8e0d0">${l.name}${giftMark}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8e0d0;text-align:center">${l.size ?? '—'}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8e0d0;text-align:center">${l.quantity}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e8e0d0;text-align:right">${formatMoney(l.price * l.quantity, data.currency)}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="${data.locale}" dir="${data.locale === 'ar' ? 'rtl' : 'ltr'}">
<head><meta charset="UTF-8"/><title>${L.subject}</title></head>
<body style="margin:0;padding:0;background:#f7f4ef;font-family:'Segoe UI',sans-serif;color:#1a1611">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e8e0d0">
  <tr><td style="background:#1a1611;padding:28px 32px;text-align:center">
    <span style="font-size:22px;font-weight:700;letter-spacing:0.2em;color:#b8973e">CLASSY MEN RIM</span>
  </td></tr>
  <tr><td style="padding:32px">
    <p style="margin:0 0 8px">${L.greeting} <strong>${data.customerName}</strong>,</p>
    <p style="margin:0 0 24px;color:#555">${L.thanks}</p>
    <p style="margin:0 0 20px;font-size:13px;color:#888;letter-spacing:0.1em;text-transform:uppercase">
      ${L.orderRef}: <strong style="color:#1a1611">${data.orderNumber}</strong>
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e0d0;border-radius:4px;font-size:14px">
      <thead><tr style="background:#f7f4ef">
        <th style="padding:10px 12px;text-align:left">${L.item}</th>
        <th style="padding:10px 12px;text-align:center">${L.size}</th>
        <th style="padding:10px 12px;text-align:center">${L.qty}</th>
        <th style="padding:10px 12px;text-align:right">${L.price}</th>
      </tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr style="background:#f7f4ef">
        <td colspan="3" style="padding:12px;font-weight:700;text-align:right">${L.total}</td>
        <td style="padding:12px;font-weight:700;text-align:right;color:#b8973e">${formatMoney(data.subtotal, data.currency)}</td>
      </tr></tfoot>
    </table>
    <p style="margin:28px 0 0;color:#555;font-size:14px;line-height:1.6">${L.closing}</p>
  </td></tr>
  <tr><td style="background:#f7f4ef;padding:20px 32px;text-align:center;font-size:12px;color:#999">
    ${L.brand}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/** Sends a confirmation email. Silently returns if SMTP is not configured. */
export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  const transport = createTransport();
  if (!transport || !data.customerEmail) return;

  const L = LABEL[data.locale ?? DEFAULT_LOCALE] ?? LABEL.fr;

  try {
    await transport.sendMail({
      from: `"Classy Men Rim" <${process.env.MAIL_USER}>`,
      to: data.customerEmail,
      subject: `${L.subject} — ${data.orderNumber}`,
      html: buildHtml(data),
    });
  } catch (err) {
    // Email failures must never break the checkout flow.
    console.error('[email] Failed to send order confirmation:', err);
  }
}

