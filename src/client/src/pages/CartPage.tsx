import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../app/useApp'
import { useCart } from '../app/useCart'
import { useToast } from '../app/useToast'
import { formatPrice } from '../components/catalog/ProductCard'
import { DEFAULT_CURRENCY } from '@shared/constants/catalog'
import { pickText } from '../lib/localized'
import { apiRequest } from '../lib/api'
import { SeoHead } from '../components/seo/SeoHead'
import { validateCouponCode, type CouponValidationResponse } from '../lib/coupon'

/** Optional WhatsApp number (used as fallback if the API order call fails). */
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER ?? ''

interface CheckoutForm {
  name: string
  phone: string
  city: string
  notes: string
}

interface OrderResult {
  orderNumber: string
  whatsappUrl: string | null
}

export function CartPage() {
  const { t, locale } = useApp()
  const { lines, subtotal, setQuantity, setGift, remove, clear } = useCart()
  const { error: toastError, luxury: toastLuxury, warning: toastWarning } = useToast()

  const currency = lines[0]?.currency ?? DEFAULT_CURRENCY

  // Coupon state
  const [couponInput, setCouponInput] = useState(() => localStorage.getItem('cmr:coupon') ?? '')
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  // Checkout form state
  const [form, setForm] = useState<CheckoutForm>({ name: '', phone: '', city: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)

  async function handleApplyCoupon(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!couponInput.trim()) return
    setCouponError(null)
    setValidatingCoupon(true)
    try {
      const res = await validateCouponCode(couponInput, subtotal)
      if (res.valid) {
        setAppliedCoupon(res)
        localStorage.setItem('cmr:coupon', res.code!)
        toastLuxury(
          locale === 'ar' ? 'تم تطبيق الكوبون' : locale === 'fr' ? 'Coupon appliqué' : 'Coupon applied!',
          `${res.code} · -${formatPrice(res.discountAmount ?? 0, currency)}`,
        )
      } else {
        setCouponError(res.message ?? 'Invalid coupon.')
        setAppliedCoupon(null)
        toastWarning(res.message ?? 'Invalid coupon.')
      }
    } catch {
      setCouponError('Failed to validate coupon.')
      toastError(locale === 'ar' ? 'فشل التحقق من الكوبون' : locale === 'fr' ? 'Erreur de validation' : 'Failed to validate coupon.')
    } finally {
      setValidatingCoupon(false)
    }
  }

  function handleRemoveCoupon() {
    setAppliedCoupon(null)
    setCouponError(null)
    localStorage.removeItem('cmr:coupon')
  }

  const discountAmount = appliedCoupon?.discountAmount ?? 0
  const finalTotal = Math.max(0, subtotal - discountAmount)

  function handleField(field: keyof CheckoutForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault()
    setCheckoutError(null)
    setSubmitting(true)

    try {
      const payload = {
        customer: { name: form.name.trim(), phone: form.phone.trim(), city: form.city.trim() || undefined, notes: form.notes.trim() || undefined },
        lines: lines.map((l) => ({
          productId: l.productId,
          size: l.size,
          quantity: l.quantity,
          isGift: l.isGift,
          giftMessage: l.giftMessage,
        })),
        couponCode: appliedCoupon?.code,
        locale,
      }

      const data = await apiRequest<OrderResult>('/api/orders', { method: 'POST', body: JSON.stringify(payload) })
      setOrderResult(data)
      clear()
      localStorage.removeItem('cmr:coupon')
      toastLuxury(
        locale === 'ar' ? 'تم إرسال طلبك بنجاح!' : locale === 'fr' ? 'Commande envoyée !' : 'Order placed!',
        data.orderNumber ? `#${data.orderNumber}` : undefined,
        6000,
      )
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer')
      }
    } catch {
      // If API fails, build a basic WhatsApp link as fallback
      if (WHATSAPP_NUMBER) {
        const items = lines
          .map((l) => `• ${pickText(l.name, locale)}${l.size ? ` (${l.size})` : ''} × ${l.quantity}`)
          .join('\n')
        const discountPart = discountAmount > 0 ? `\n${t('coupon.discount')} (${appliedCoupon?.code}): -${formatPrice(discountAmount, currency)}` : ''
        const msg = `${t('cart.title')}\n${items}\n${discountPart}\n\n${t('cart.total')}: ${formatPrice(finalTotal, currency)}\n${form.name} | ${form.phone}`
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
        clear()
        localStorage.removeItem('cmr:coupon')
        setOrderResult({ orderNumber: '', whatsappUrl: null })
      } else {
        setCheckoutError(t('checkout.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (orderResult) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 py-24 text-center sm:px-6">
        <span className="text-5xl">✨</span>
        <h1 className="mt-6 font-display text-3xl text-ink">
          {orderResult.orderNumber ? `${t('checkout.orderNumber')}: ${orderResult.orderNumber}` : t('cart.checkout')}
        </h1>
        <p className="mt-4 font-sans text-sm text-ink/60">
          {orderResult.whatsappUrl
            ? 'WhatsApp açıldı. Siparişini tamamlamak için gönder butonuna bas.'
            : "Siparişin WhatsApp'ta açıldı."}
        </p>
        <Link
          to="/catalog"
          className="mt-10 inline-flex rounded-brand bg-gold px-8 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark"
        >
          {t('cart.emptyCta')}
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6">
      <SeoHead title={t('cart.title')} />
      <h1 className="font-display text-4xl text-ink">{t('cart.title')}</h1>

      {lines.length === 0 ? (
        <div className="mt-10">
          <p className="text-ink/70">{t('cart.empty')}</p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex rounded-brand bg-gold px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark"
          >
            {t('cart.emptyCta')}
          </Link>
        </div>
      ) : (
        <>
          {/* ── Line items ── */}
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {lines.map((line) => {
              const key = `${line.productId}::${line.size ?? ''}`
              return (
                <li key={key} className="py-5">
                  <div className="flex gap-4">
                    <Link to={`/product/${line.slug}`} className="shrink-0">
                      <div className="h-24 w-20 overflow-hidden rounded-brand border border-line bg-cream-card">
                        {line.image ? (
                          <img src={line.image} alt="" className="h-full w-full object-cover" />
                        ) : null}
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Link
                            to={`/product/${line.slug}`}
                            className="font-display text-lg text-ink transition-colors hover:text-gold"
                          >
                            {pickText(line.name, locale)}
                          </Link>
                          {line.size && (
                            <p className="mt-1 font-sans text-xs uppercase tracking-[0.15em] text-ink/50">
                              {t('product.sizes')}: {line.size}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(line.productId, line.size)}
                          className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60 transition-colors hover:text-gold"
                        >
                          {t('cart.remove')}
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center border border-line">
                          <button
                            type="button"
                            aria-label={`${t('cart.quantity')} -`}
                            onClick={() => setQuantity(line.productId, line.size, line.quantity - 1)}
                            className="h-9 w-9 font-sans text-sm text-ink/70 transition-colors hover:text-gold"
                          >
                            −
                          </button>
                          <span className="w-10 text-center font-sans text-sm text-ink">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label={`${t('cart.quantity')} +`}
                            onClick={() => setQuantity(line.productId, line.size, line.quantity + 1)}
                            className="h-9 w-9 font-sans text-sm text-ink/70 transition-colors hover:text-gold"
                          >
                            +
                          </button>
                        </div>
                        <p className="font-sans text-sm text-ink/80">
                          {formatPrice(line.price * line.quantity, line.currency)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Gift toggle ── */}
                  <div className="mt-3 ms-24 flex flex-col gap-2">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={line.isGift ?? false}
                        onChange={(e) => setGift(line.productId, line.size, e.target.checked)}
                        className="h-4 w-4 cursor-pointer accent-gold"
                      />
                      <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                        {t('cart.gift')}
                      </span>
                    </label>

                    <AnimatePresence>
                      {line.isGift && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <input
                            type="text"
                            placeholder={t('cart.giftPlaceholder')}
                            value={line.giftMessage ?? ''}
                            onChange={(e) => setGift(line.productId, line.size, true, e.target.value)}
                            className="mt-1 w-full max-w-sm rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-xs text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                            aria-label={t('cart.giftMessage')}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* ── Coupon & Summary + actions ── */}
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="w-full max-w-xs">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('coupon.placeholder')}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  disabled={Boolean(appliedCoupon)}
                  className="w-full rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-xs uppercase tracking-wider text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none disabled:opacity-60"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="rounded-brand border border-line px-3 py-2 font-sans text-xs uppercase tracking-[0.1em] text-ink/60 transition-colors hover:border-gold hover:text-gold"
                  >
                    {t('coupon.remove')}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={validatingCoupon || !couponInput.trim()}
                    className="rounded-brand bg-gold px-4 py-2 font-sans text-xs uppercase tracking-[0.1em] text-cream-card transition-colors hover:bg-gold-dark disabled:opacity-50"
                  >
                    {validatingCoupon ? '…' : t('coupon.apply')}
                  </button>
                )}
              </form>

              {appliedCoupon && (
                <p className="mt-1.5 font-sans text-xs text-gold">
                  ✓ {t('coupon.applied')}: -{formatPrice(discountAmount, currency)} ({appliedCoupon.code})
                </p>
              )}
              {couponError && (
                <p role="alert" className="mt-1.5 font-sans text-xs text-red-500">
                  {couponError}
                </p>
              )}

              <button
                type="button"
                onClick={clear}
                className="mt-6 font-sans text-xs uppercase tracking-[0.2em] text-ink/50 transition-colors hover:text-gold"
              >
                {t('cart.clear')}
              </button>
            </div>

            <div className="sm:text-end">
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between gap-4 font-sans text-xs uppercase tracking-[0.15em] text-ink/60 sm:justify-end">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="mt-1 flex justify-between gap-4 font-sans text-xs uppercase tracking-[0.15em] text-gold sm:justify-end">
                    <span>{t('coupon.discount')}:</span>
                    <span>-{formatPrice(discountAmount, currency)}</span>
                  </div>
                </>
              )}

              <p className="mt-2 font-sans text-xs uppercase tracking-[0.2em] text-ink/60">{t('cart.total')}</p>
              <p className="mt-1 font-display text-2xl text-ink">{formatPrice(finalTotal, currency)}</p>

              <button
                type="button"
                onClick={() => setShowCheckout((v) => !v)}
                className="mt-4 inline-flex rounded-brand bg-gold px-8 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark"
              >
                {t('cart.checkout')}
              </button>
            </div>
          </div>

          {/* ── Checkout form (slide in) ── */}
          <AnimatePresence>
            {showCheckout && (
              <motion.form
                key="checkout-form"
                onSubmit={handleCheckout}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.3 }}
                className="mt-10 grid gap-5 rounded-brand border border-line p-6 sm:grid-cols-2"
              >
                {/* Name */}
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('checkout.name')} *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={handleField('name')}
                    className="rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('checkout.phone')} *
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={handleField('phone')}
                    className="rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1">
                  <label className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('checkout.city')}
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={handleField('city')}
                    className="rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('checkout.notes')}
                  </label>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={handleField('notes')}
                    className="rounded-brand border border-line bg-transparent px-3 py-2 font-sans text-sm text-ink placeholder:text-ink/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {checkoutError && (
                  <p role="alert" className="font-sans text-xs text-red-500 sm:col-span-2">
                    {checkoutError}
                  </p>
                )}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-brand bg-gold px-8 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? t('checkout.submitting') : t('checkout.submit')}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  )
}
