import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../app/useApp'
import { useCategories } from '../app/useCategories'
import { ProductCard } from '../components/catalog/ProductCard'
import { SeoHead } from '../components/seo/SeoHead'
import { fetchProducts } from '../lib/catalog'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'

export function CatalogPage() {
  const { t, locale } = useApp()
  const categories = useCategories()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchProducts({ includeInactive: false, limit: 48 })
      .then((page) => {
        if (!cancelled) setProducts(page.items)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load the catalog.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <SeoHead title={t('catalog.title')} description={t('catalog.subtitle')} />
      <p className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.35em] text-gold">
        <span className="h-px w-8 bg-gold" aria-hidden="true" />
        {t('nav.catalog')}
      </p>
      <h1 className="mt-5 font-display text-4xl text-ink sm:text-5xl">{t('catalog.title')}</h1>
      <p className="mt-3 max-w-lg text-ink/70">{t('catalog.subtitle')}</p>

      {categories.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/category/${category.slug}`}
              className="rounded-brand border border-line px-4 py-2 font-sans text-xs uppercase tracking-[0.15em] text-ink/70 transition-colors hover:border-gold hover:text-gold"
            >
              {pickText(category.name, locale)}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        {loading && <p className="font-sans text-sm text-ink/60">{t('common.loading')}</p>}

        {!loading && error && (
          <p role="alert" className="font-sans text-sm text-gold-dark">
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="font-sans text-sm text-ink/60">{t('catalog.empty')}</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
