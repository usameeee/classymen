import { apiRequest } from './api'

export interface CouponValidationResponse {
  valid: boolean
  code?: string
  discountAmount: number
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  message?: string
}

export interface AdminCoupon {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscount?: number
  expiresAt?: string
  usageLimit?: number
  usedCount: number
  isActive: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export async function validateCouponCode(code: string, subtotal: number): Promise<CouponValidationResponse> {
  return apiRequest<CouponValidationResponse>('/api/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  })
}

export async function fetchAdminCoupons(): Promise<{ coupons: AdminCoupon[] }> {
  return apiRequest<{ coupons: AdminCoupon[] }>('/api/coupons')
}

export async function createAdminCoupon(data: Partial<AdminCoupon>): Promise<{ coupon: AdminCoupon }> {
  return apiRequest<{ coupon: AdminCoupon }>('/api/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteAdminCoupon(id: string): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/api/coupons/${id}`, {
    method: 'DELETE',
  })
}

