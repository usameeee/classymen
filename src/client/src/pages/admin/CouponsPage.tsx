import { useCallback, useEffect, useState } from 'react'
import {
  fetchAdminCoupons,
  createAdminCoupon,
  deleteAdminCoupon,
  type AdminCoupon,
} from '../../lib/coupon'

export function CouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New coupon form state
  const [showCreate, setShowCreate] = useState(false)
  const [code, setCode] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState(10)
  const [minOrderAmount, setMinOrderAmount] = useState(0)
  const [maxDiscount, setMaxDiscount] = useState<number | undefined>(undefined)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchAdminCoupons()
      setCoupons(res.coupons)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load coupons.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await createAdminCoupon({
        code: code.trim().toUpperCase(),
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount: maxDiscount || undefined,
        description: description.trim() || undefined,
        isActive: true,
      })
      setShowCreate(false)
      setCode('')
      setDescription('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create coupon.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string, couponCode: string) {
    if (!window.confirm(`Delete coupon "${couponCode}"?`)) return
    setError(null)
    try {
      await deleteAdminCoupon(id)
      setCoupons((prev) => prev.filter((c) => c._id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete coupon.')
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Coupons & Discounts</h1>
          <p className="mt-1 font-sans text-xs uppercase tracking-[0.2em] text-ink/60">
            Promotional codes and wheel incentives
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex rounded-brand bg-gold px-5 py-2.5 font-sans text-xs uppercase tracking-[0.15em] text-cream-card transition-colors hover:bg-gold-dark"
        >
          {showCreate ? 'Close Form' : '+ New Coupon'}
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-brand border border-gold/40 bg-gold/10 p-4 font-sans text-sm text-gold-dark">
          {error}
        </div>
      )}

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mt-6 rounded-brand border border-line bg-cream-card p-6 shadow-sm"
        >
          <h2 className="font-display text-xl text-ink">Create New Promo Code</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                Code *
              </label>
              <input
                required
                type="text"
                placeholder="e.g. VIP20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm uppercase text-ink focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className="mt-1 w-full rounded-brand border border-line bg-cream-card px-3 py-2 font-sans text-sm text-ink focus:border-gold focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (MRU)</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                Discount Value *
              </label>
              <input
                required
                type="number"
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm text-ink focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                Min. Order Amount (MRU)
              </label>
              <input
                type="number"
                min={0}
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm text-ink focus:border-gold focus:outline-none"
              />
            </div>

            {discountType === 'percentage' && (
              <div>
                <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                  Max Discount Cap (MRU, optional)
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxDiscount ?? ''}
                  onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : undefined)}
                  className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                />
              </div>
            )}

            <div className={discountType === 'percentage' ? '' : 'sm:col-span-2'}>
              <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                Description / Notes
              </label>
              <input
                type="text"
                placeholder="e.g. VIP Member special discount"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm text-ink focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 rounded-brand bg-gold px-6 py-2.5 font-sans text-xs uppercase tracking-[0.15em] text-cream-card hover:bg-gold-dark disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Save Coupon'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="mt-8 font-sans text-sm text-ink/60">Loading coupons…</p>
      ) : coupons.length === 0 ? (
        <div className="mt-8 rounded-brand border border-dashed border-line p-10 text-center">
          <p className="font-sans text-sm text-ink/60">No coupons created yet.</p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-brand border border-line bg-cream-card shadow-sm">
          <table className="w-full text-left font-sans text-sm">
            <thead className="border-b border-line bg-cream/50 text-xs uppercase tracking-[0.15em] text-ink/60">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Discount</th>
                <th className="px-4 py-3">Min. Order</th>
                <th className="px-4 py-3">Uses</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {coupons.map((c) => (
                <tr key={c._id} className="transition-colors hover:bg-cream/30">
                  <td className="px-4 py-3.5 font-bold tracking-wider text-gold">{c.code}</td>
                  <td className="px-4 py-3.5 text-ink">
                    {c.discountType === 'percentage' ? `${c.discountValue}%` : `${c.discountValue} MRU`}
                    {c.maxDiscount ? ` (max ${c.maxDiscount} MRU)` : ''}
                  </td>
                  <td className="px-4 py-3.5 text-ink/70">
                    {c.minOrderAmount > 0 ? `${c.minOrderAmount} MRU` : 'None'}
                  </td>
                  <td className="px-4 py-3.5 text-ink/70">{c.usedCount}</td>
                  <td className="px-4 py-3.5 text-xs text-ink/60">{c.description ?? '—'}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(c._id, c.code)}
                      className="text-xs uppercase tracking-[0.15em] text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

