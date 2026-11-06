import type { OrderStatus } from '@shared/constants/orderStatus'
import { apiRequest } from './api'

export interface OrderItem {
  _id?: string
  product: string
  name: string
  size?: string
  price: number
  quantity: number
}

export interface OrderCustomer {
  name: string
  phone: string
  email?: string
  city?: string
  address?: string
  notes?: string
}

export interface AdminOrder {
  _id: string
  orderNumber: string
  customer: OrderCustomer
  items: OrderItem[]
  subtotal: number
  total: number
  currency: string
  status: OrderStatus
  whatsappConfirmed: boolean
  locale: string
  createdAt: string
  updatedAt: string
}

export interface OrderListResponse {
  items: AdminOrder[]
  total: number
  page: number
  limit: number
  pages: number
}

export async function fetchAdminOrders(params: { page?: number; limit?: number; status?: string } = {}): Promise<OrderListResponse> {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.status) query.set('status', params.status)

  const qs = query.toString()
  return apiRequest<OrderListResponse>(`/api/orders${qs ? `?${qs}` : ''}`)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ order: AdminOrder }> {
  return apiRequest<{ order: AdminOrder }>(`/api/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

