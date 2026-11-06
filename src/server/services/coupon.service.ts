import { CouponModel, type Coupon } from '../models/Coupon'

export interface ValidationResult {
  valid: boolean
  code?: string
  discountAmount: number
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  message?: string
}

/** Validates coupon against current cart subtotal and calculates discount. */
export async function validateCoupon(code: string, subtotal: number): Promise<ValidationResult> {
  const cleanCode = code.trim().toUpperCase()
  if (!cleanCode) {
    return { valid: false, discountAmount: 0, message: 'Invalid coupon code.' }
  }

  const coupon = await CouponModel.findOne({ code: cleanCode, isActive: true })
  if (!coupon) {
    return { valid: false, discountAmount: 0, message: 'Coupon code not found or inactive.' }
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, discountAmount: 0, message: 'This coupon has expired.' }
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discountAmount: 0, message: 'Coupon usage limit has been reached.' }
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      valid: false,
      discountAmount: 0,
      message: `Minimum order amount for this coupon is ${coupon.minOrderAmount} MRU.`,
    }
  }

  let discount = 0
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.discountValue) / 100
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal)
  }

  // Round to 2 decimals
  discount = Math.round(discount * 100) / 100

  return {
    valid: true,
    code: coupon.code,
    discountAmount: discount,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    message: 'Coupon applied successfully.',
  }
}

/** Increments coupon usage count upon successful order creation. */
export async function applyCouponUsage(code: string): Promise<void> {
  const cleanCode = code.trim().toUpperCase()
  await CouponModel.updateOne({ code: cleanCode }, { $inc: { usedCount: 1 } })
}

/** Admin: List all coupons. */
export async function listCoupons() {
  return CouponModel.find().sort({ createdAt: -1 }).lean()
}

/** Admin: Create new coupon. */
export async function createCoupon(data: Partial<Coupon>) {
  if (data.code) {
    data.code = data.code.trim().toUpperCase()
  }
  return CouponModel.create(data)
}

/** Admin: Delete coupon. */
export async function deleteCoupon(id: string) {
  return CouponModel.findByIdAndDelete(id)
}

/** Seed default coupons if none exist. */
export async function seedDefaultCoupons() {
  const count = await CouponModel.countDocuments()
  if (count === 0) {
    await CouponModel.insertMany([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 500,
        description: '10% off for new gentlemen',
      },
      {
        code: 'CLASSY5',
        discountType: 'percentage',
        discountValue: 5,
        minOrderAmount: 0,
        description: '5% instant wheel prize',
      },
      {
        code: 'VIP15',
        discountType: 'percentage',
        discountValue: 15,
        minOrderAmount: 2000,
        description: '15% luxury VIP discount',
      },
      {
        code: 'MRU200',
        discountType: 'fixed',
        discountValue: 200,
        minOrderAmount: 1000,
        description: '200 MRU fixed voucher',
      },
    ])
  }
}

