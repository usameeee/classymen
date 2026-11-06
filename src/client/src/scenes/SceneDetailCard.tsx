import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useApp } from '../app/useApp'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'

/**
 * In-scene modal card shown when a scene item is activated (tap/Enter).
 * `Esc` or a backdrop click closes it; the CTA links through to the product page.
 * Shared by every interactive scene. @see docs/DISPLAY_SYSTEM.md
 */
export function SceneDetailCard({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t, locale } = useApp()
  const image = primaryImage(product)
  const name = pickText(product.name, locale)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="w-full max-w-sm overflow-hidden rounded-brand border border-line bg-cream-card shadow-xl"
        initial={{ opacity: 0, scale: 0.86, rotate: -3 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-cream">
          {image && (
            <img src={image.url} alt={image.alt ?? name} className="h-full w-full object-cover" />
          )}
        </div>

        <div className="p-5">
          <h3 className="font-display text-xl text-ink">{name}</h3>
          <p className="mt-1 font-sans text-sm text-ink/70">
            {formatPrice(product.price, product.currency)}
          </p>

          <div className="mt-5 flex items-center gap-4">
            <Link
              to={`/product/${product.slug}`}
              className="rounded-brand bg-gold px-4 py-2 font-sans text-xs uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark"
            >
              {t('product.details')}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
            >
              {t('menu.close')}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
