import { useCallback, useEffect, useState } from 'react'
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderStatus } from '@shared/constants/orderStatus'
import { fetchAdminOrders, updateOrderStatus, type AdminOrder } from '../../lib/order'
import { formatPrice } from '../../components/catalog/ProductCard'

export function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAdminOrders({ status: statusFilter || undefined, limit: 50 })
      setOrders(res.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  async function handleStatusChange(orderId: string, newStatus: OrderStatus) {
    setUpdatingId(orderId)
    setError(null)
    try {
      const res = await updateOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map((o) => (o._id === orderId ? res.order : o)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status.')
    } finally {
      setUpdatingId(null)
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Orders</h1>
          <p className="mt-1 font-sans text-xs uppercase tracking-[0.2em] text-ink/60">
            Customer inquiries and purchases
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
            Filter Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-brand border border-line bg-cream-card px-3 py-2 font-sans text-xs uppercase tracking-[0.1em] text-ink focus:border-gold focus:outline-none"
          >
            <option value="">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {ORDER_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-brand border border-gold/40 bg-gold/10 p-4 font-sans text-sm text-gold-dark">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-8 font-sans text-sm text-ink/60">Loading orders…</p>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-brand border border-dashed border-line p-10 text-center">
          <p className="font-sans text-sm text-ink/60">No orders found.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-brand border border-line bg-cream-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="border-b border-line bg-cream/50 text-xs uppercase tracking-[0.15em] text-ink/60">
                <tr>
                  <th className="px-4 py-3">Order Ref</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => {
                  const isExpanded = expandedId === order._id
                  const isUpdating = updatingId === order._id
                  return (
                    <tr key={order._id} className="group transition-colors hover:bg-cream/30">
                      <td className="px-4 py-3.5 font-medium text-gold">
                        <button
                          type="button"
                          onClick={() => toggleExpand(order._id)}
                          className="hover:underline"
                        >
                          {order.orderNumber}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-ink">{order.customer.name}</td>
                      <td className="px-4 py-3.5 text-ink/70">
                        <a
                          href={`https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold hover:underline"
                        >
                          {order.customer.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-ink/70">
                        {order.items.reduce((acc, it) => acc + it.quantity, 0)} item(s)
                      </td>
                      <td className="px-4 py-3.5 font-medium text-ink">
                        {formatPrice(order.total, order.currency)}
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={order.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleStatusChange(order._id, e.target.value as OrderStatus)
                          }
                          className="rounded-brand border border-line bg-cream px-2.5 py-1 text-xs uppercase tracking-[0.1em] text-ink focus:border-gold focus:outline-none disabled:opacity-50"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {ORDER_STATUS_LABELS[st]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-ink/50">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => toggleExpand(order._id)}
                          className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60 transition-colors hover:text-gold"
                        >
                          {isExpanded ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Expanded Drawer / Detail View */}
          {expandedId && (
            <div className="border-t border-line bg-cream/40 p-6">
              {(() => {
                const target = orders.find((o) => o._id === expandedId)
                if (!target) return null
                return (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="font-display text-lg text-ink">Customer & Delivery Details</h3>
                      <dl className="mt-3 space-y-1.5 font-sans text-xs text-ink/80">
                        <div>
                          <dt className="inline font-medium text-ink/50">Name: </dt>
                          <dd className="inline font-medium text-ink">{target.customer.name}</dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-ink/50">Phone: </dt>
                          <dd className="inline">{target.customer.phone}</dd>
                        </div>
                        {target.customer.email && (
                          <div>
                            <dt className="inline font-medium text-ink/50">Email: </dt>
                            <dd className="inline">{target.customer.email}</dd>
                          </div>
                        )}
                        {target.customer.city && (
                          <div>
                            <dt className="inline font-medium text-ink/50">City: </dt>
                            <dd className="inline">{target.customer.city}</dd>
                          </div>
                        )}
                        {target.customer.address && (
                          <div>
                            <dt className="inline font-medium text-ink/50">Address: </dt>
                            <dd className="inline">{target.customer.address}</dd>
                          </div>
                        )}
                        {target.customer.notes && (
                          <div className="mt-2 rounded-brand border border-line bg-cream-card p-2 text-ink/90">
                            <span className="font-medium text-gold">Notes: </span>
                            {target.customer.notes}
                          </div>
                        )}
                      </dl>
                    </div>

                    <div>
                      <h3 className="font-display text-lg text-ink">Order Items</h3>
                      <ul className="mt-3 divide-y divide-line border-y border-line text-xs font-sans">
                        {target.items.map((item, idx) => (
                          <li key={idx} className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium text-ink">
                                {item.name} {item.size ? `(${item.size})` : ''}
                              </p>
                              <p className="text-ink/50">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-medium text-ink">
                              {formatPrice(item.price * item.quantity, target.currency)}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex justify-between font-display text-base text-ink">
                        <span>Total</span>
                        <span className="text-gold">{formatPrice(target.total, target.currency)}</span>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

