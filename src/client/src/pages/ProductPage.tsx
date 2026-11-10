import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useApp } from '../app/useApp'
import { useCart } from '../app/useCart'
import { useToast } from '../app/useToast'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import { SizingAssistantModal } from '../components/sizing/SizingAssistantModal'
import { fetchProduct } from '../lib/catalog'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SeoHead } from '../components/seo/SeoHead'

export function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t, locale } = useApp()
  const { add } = useCart()
  const { success: toastSuccess } = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState(0)
  const [size, setSize] = useState<string | undefined>(undefined)
  const [sizingOpen, setSizingOpen] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setAdded(false)

    fetchProduct(slug)
      .then((data) => {
        if (cancelled) return
        setProduct(data)
        setActiveImage(0)
        setSize(data.sizes[0])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t('product.notFound'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // `t` is intentionally excluded: reloading on locale change is unnecessary.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  function handleAdd() {
    if (!product) return
    const image = primaryImage(product)
    add(
      {
        productId: product._id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        currency: product.currency,
        image: image?.url,
        size,
      },
      1,
    )
    setAdded(true)
    toastSuccess(
      t('product.added'),
      pickText(product.name, locale),
      3000,
    )
  }

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <p className="font-sans text-sm text-ink/60">{t('common.loading')}</p>
      </section>
    )
  }

  if (error || !product) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
        <p role="alert" className="font-sans text-sm text-gold-dark">
          {error ?? t('product.notFound')}
        </p>
        <Link
          to="/catalog"
          className="mt-6 inline-block font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
        >
          {t('catalog.back')}
        </Link>
      </section>
    )
  }

  const name = pickText(product.name, locale)
  const description = pickText(product.description, locale)
  const images = product.images
  const current = images[activeImage]
  const inStock = product.stock > 0 || product.isMadeToMeasure
  const onSale = product.compareAtPrice !== undefined && product.compareAtPrice > product.price

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <SeoHead
        title={name}
        description={description}
        image={current?.url}
        type="product"
      />
      <Link
        to={`/category/${product.category.slug}`}
        className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
      >
        {pickText(product.category.name, locale)}
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-[3/4] overflow-hidden rounded-brand border border-line bg-cream-card">
            {current ? (
              <img src={current.url} alt={current.alt ?? name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-display text-6xl text-gold/30">{name.charAt(0)}</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((image, index) => (
                <button
                  key={image.publicId ?? image.url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-16 overflow-hidden rounded-brand border transition-colors ${
                    index === activeImage ? 'border-gold' : 'border-line hover:border-gold'
                  }`}
                >
                  <img src={image.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-3xl text-ink sm:text-4xl">{name}</h1>

          <p className="mt-3 font-sans text-lg text-ink/80">
            {formatPrice(product.price, product.currency)}
            {onSale && (
              <span className="ms-3 text-base text-ink/40 line-through">
                {formatPrice(product.compareAtPrice as number, product.currency)}
              </span>
            )}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className={`font-sans text-xs uppercase tracking-[0.15em] ${inStock ? 'text-gold' : 'text-ink/50'}`}>
              {inStock ? t('product.inStock') : t('product.outOfStock')}
            </span>
            {product.isMadeToMeasure && (
              <span className="rounded-brand border border-gold px-2 py-1 font-sans text-[10px] uppercase tracking-[0.2em] text-gold">
                {t('product.measure')}
              </span>
            )}
          </div>

          {description && (
            <div className="mt-6">
              <h2 className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">
                {t('product.details')}
              </h2>
              <p className="mt-3 leading-relaxed text-ink/80">{description}</p>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">
                  {t('product.sizes')}
                </span>
                {(product.tags.includes('daraa') ||
                  product.sizes.some((s) => ['6', '8', '10'].includes(s)) ||
                  product.isMadeToMeasure) && (
                  <button
                    type="button"
                    onClick={() => setSizingOpen(true)}
                    className="flex items-center gap-1.5 font-sans text-xs font-medium text-gold underline-offset-4 hover:underline"
                  >
                    <span>✨</span>
                    <span>{t('sizing.button')}</span>
                  </button>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSize(option)}
                    className={`min-w-12 rounded-brand border px-3 py-2 font-sans text-sm transition-colors ${
                      size === option
                        ? 'border-gold bg-gold text-cream-card'
                        : 'border-line text-ink/70 hover:border-gold hover:text-gold'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {sizingOpen && (
              <SizingAssistantModal
                initialSize={size}
                onClose={() => setSizingOpen(false)}
                onSelectSize={(selected) => {
                  setSize(selected)
                }}
              />
            )}
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleAdd}
              disabled={!inStock}
              className="rounded-brand bg-gold px-8 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t('product.addToCart')}
            </button>

            {added && (
              <Link
                to="/cart"
                className="font-sans text-xs uppercase tracking-[0.2em] text-gold transition-colors hover:text-gold-dark"
              >
                {t('product.added')} — {t('cart.title')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
