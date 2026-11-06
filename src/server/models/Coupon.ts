import { Schema, model, type InferSchemaType } from 'mongoose'

export const COUPON_DISCOUNT_TYPES = ['percentage', 'fixed'] as const
export type CouponDiscountType = (typeof COUPON_DISCOUNT_TYPES)[number]

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      enum: COUPON_DISCOUNT_TYPES,
      required: true,
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    expiresAt: {
      type: Date,
    },
    usageLimit: {
      type: Number,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
)

export type Coupon = InferSchemaType<typeof couponSchema>
export const CouponModel = model('Coupon', couponSchema)

