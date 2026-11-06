import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createOrder } from '../services/order.service';
import { LOCALES } from '@shared/constants/locales';
import { ORDER_STATUSES, TERMINAL_ORDER_STATUSES } from '@shared/constants/orderStatus';
import { OrderModel } from '../models/Order';
import { requireAuth } from '../middleware/auth';
import { routeParam } from '../utils/http';

export const orderRouter = Router();

/** Zod schema for the public order creation payload. */
const createOrderSchema = z.object({
  customer: z.object({
    name: z.string().min(1, 'Name is required').max(120),
    phone: z.string().min(6, 'Phone is required').max(30),
    email: z.string().email().optional().or(z.literal('')).transform((v) => v || undefined),
    city: z.string().max(80).optional(),
    address: z.string().max(300).optional(),
    notes: z.string().max(600).optional(),
  }),
  lines: z
    .array(
      z.object({
        productId: z.string().length(24, 'Invalid product id'),
        size: z.string().optional(),
        quantity: z.number().int().min(1).max(99),
        isGift: z.boolean().optional(),
        giftMessage: z.string().max(300).optional(),
      }),
    )
    .min(1, 'Cart is empty'),
  couponCode: z.string().trim().max(30).optional(),
  locale: z.enum([...LOCALES] as [string, ...string[]]).optional(),
});

/** POST /api/orders — Public, no auth required. */
orderRouter.post('/', async (req: Request, res: Response) => {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation failed', details: result.error.flatten() });
    return;
  }

  try {
    const waNumber = process.env.VITE_WHATSAPP_NUMBER ?? '';
    const { order, whatsappUrl } = await createOrder(result.data as Parameters<typeof createOrder>[0], waNumber);
    res.status(201).json({
      orderNumber: order.orderNumber,
      whatsappUrl,
      status: order.status,
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    res.status(e.status ?? 500).json({ error: e.message ?? 'Internal server error' });
  }
});

/* ── Admin routes (require auth) ───────────────────────────────────────────── */

/** GET /api/orders — Paginated list (admin). */
orderRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const status = req.query.status as string | undefined;

  const filter: Record<string, unknown> = {};
  if (status && (ORDER_STATUSES as readonly string[]).includes(status)) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    OrderModel.countDocuments(filter),
  ]);

  res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
});

/** GET /api/orders/:id — Single order detail (admin). */
orderRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = routeParam(req.params.id);
  const order = await OrderModel.findById(id).lean();
  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  res.json({ order });
});

/** PATCH /api/orders/:id/status — Update order status (admin). */
orderRouter.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  const id = routeParam(req.params.id);
  const result = z.object({ status: z.enum([...ORDER_STATUSES] as [string, ...string[]]) }).safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Invalid status.' });
    return;
  }

  const order = await OrderModel.findById(id);
  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  if ((TERMINAL_ORDER_STATUSES as readonly string[]).includes(order.status)) {
    res.status(409).json({ error: 'Order is in a terminal state and cannot be updated.' });
    return;
  }

  order.status = result.data.status as (typeof ORDER_STATUSES)[number];
  if (result.data.status === 'confirmed') order.whatsappConfirmed = true;
  await order.save();

  res.json({ order });
});

