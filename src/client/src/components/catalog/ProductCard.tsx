import { Link } from 'react-router-dom'
import { useApp } from '../../app/useApp'
import { pickText } from '../../lib/localized'
import type { Product } from '../../lib/catalog'

/** Picks the primary product photo, preferring images tagged with the `product` role. */
export function primaryImage(product: Product) {
  return product.images.find((image) => image.role === 'product') ?? product.images[0]
}

export function formatPrice(price: number, currency: string) {
  return `${price.toLocaleString()} ${currency}`
}

export function ProductCard({ product }: { product: Product }) {
  const { t, locale } = useApp()
  const image = primaryImage(product)
  const name = pickText(product.name, locale)
  const onSale = product.compareAtPrice !== undefined && product.compareAtPrice > product.price

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-brand border border-line bg-cream-card">
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-4xl text-gold/30">{name.charAt(0)}</span>
          </div>
        )}

        {product.isMadeToMeasure && (
          <span className="absolute start-3 top-3 rounded-brand bg-cream-card/90 px-2 py-1 font-sans text-[10px] uppercase tracking-[0.2em] text-gold">
            {t('product.measure')}
          </span>
        )}
      </div>

      <h3 className="mt-3 font-display text-lg text-ink transition-colors group-hover:text-gold">
        {name}
      </h3>

      <p className="mt-1 font-sans text-sm text-ink/70">
        {formatPrice(product.price, product.currency)}
        {onSale && (
          <span className="ms-2 text-ink/40 line-through">
            {formatPrice(product.compareAtPrice as number, product.currency)}
          </span>
        )}
      </p>
    </Link>
  )
}
