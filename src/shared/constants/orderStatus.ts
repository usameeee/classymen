/**
 * Order lifecycle. Checkout starts on WhatsApp, so `awaiting_whatsapp`
 * is the entry state before an operator confirms the order.
 * @see docs/PROJECT_BRIEF.md
 */
export const ORDER_STATUSES = [
  'draft',
  'awaiting_whatsapp',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DEFAULT_ORDER_STATUS: OrderStatus = 'draft';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Draft',
  awaiting_whatsapp: 'Awaiting WhatsApp',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/** Statuses that can no longer be modified. */
export const TERMINAL_ORDER_STATUSES: readonly OrderStatus[] = ['delivered', 'cancelled'];
