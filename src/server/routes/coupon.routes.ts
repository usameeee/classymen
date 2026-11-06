import { Router, type Request, type Response } from 'express'
import { z } from 'zod'
import {
  validateCoupon,
  listCoupons,
  createCoupon,
  deleteCoupon,
} from '../services/coupon.service'
import { requireAuth } from '../middleware/auth'
import { routeParam } from '../utils/http'
import { COUPON_DISCOUNT_TYPES } from '../models/Coupon'

export const couponRouter = Router()

/** POST /api/coupons/validate — Public */
couponRouter.post('/validate', async (req: Request, res: Response) => {
  const schema = z.object({
    code: z.string().min(1),
    subtotal: z.number().min(0),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Code and subtotal are required.' })
    return
  }

  try {
    const result = await validateCoupon(parsed.data.code, parsed.data.subtotal)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: 'Failed to validate coupon.' })
  }
})

/* ── Admin Routes ────────────────────────────────────────── */

/** GET /api/coupons — Admin */
couponRouter.get('/', requireAuth, async (_req: Request, res: Response) => {
  try {
    const coupons = await listCoupons()
    res.json({ coupons })
  } catch (err) {
    res.status(500).json({ error: 'Failed to list coupons.' })
  }
})

/** POST /api/coupons — Admin */
couponRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  const schema = z.object({
    code: z.string().min(2).max(30),
    discountType: z.enum(COUPON_DISCOUNT_TYPES),
    discountValue: z.number().positive(),
    minOrderAmount: z.number().min(0).default(0),
    maxDiscount: z.number().positive().optional(),
    expiresAt: z.string().datetime().optional().or(z.literal('')).transform((v) => (v ? new Date(v) : undefined)),
    usageLimit: z.number().int().positive().optional(),
    description: z.string().max(200).optional(),
    isActive: z.boolean().default(true),
  })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() })
    return
  }

  try {
    const coupon = await createCoupon(parsed.data)
    res.status(201).json({ coupon })
  } catch (err: unknown) {
    const e = err as { code?: number }
    if (e.code === 11000) {
      res.status(409).json({ error: 'A coupon with this code already exists.' })
      return
    }
    res.status(500).json({ error: 'Failed to create coupon.' })
  }
})

/** DELETE /api/coupons/:id — Admin */
couponRouter.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  const id = routeParam(req.params.id)
  try {
    await deleteCoupon(id)
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete coupon.' })
  }
})

