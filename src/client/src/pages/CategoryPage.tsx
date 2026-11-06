import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { DEFAULT_DISPLAY_STYLE } from '@shared/constants/displayStyles'
import { useApp } from '../app/useApp'
import { fetchCategories, fetchCategory, fetchProducts } from '../lib/catalog'
import type { Category, Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneRenderer } from '../scenes/SceneRenderer'
import { DressingRoomModal } from '../components/dressing-room/DressingRoomModal'
import { SeoHead } from '../components/seo/SeoHead'

/** Slugs where the "Build a Look" button is contextually relevant. */
const DRESSING_ROOM_SLUGS = new Set([
  'tradition', 'daraa', 'azbi', 'azbi-blanc', 'azbi-colore',
  'pret-a-porter', 'chemises', 'polos', 'costumes', 'manches-longues',
])

export function CategoryPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t, locale } = useApp()

  const [category, setCategory] = useState<Category | null>(null)
  const [subcategories, setSubcategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dressingOpen, setDressingOpen] = useState(false)
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCategory(slug)
      .then(async (categoryData) => {
        if (cancelled) return
        setCategory(categoryData)

        const [page, subs] = await Promise.all([
          fetchProducts({ category: slug, includeInactive: false, limit: 48 }),
          fetchCategories({ parent: categoryData._id, includeInactive: false }),
        ])
        if (cancelled) return
        setProducts(page.items)
        setSubcategories(subs)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load the category.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      {category && (
        <SeoHead
          title={pickText(category.name, locale)}
          description={pickText(category.description, locale)}
          image={category.image?.url}
        />
      )}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-ink/60"
      >
        <Link to="/catalog" className="transition-colors hover:text-gold">
          {t('catalog.back')}
        </Link>
        {category?.parent && (
          <>
            <span className="text-ink/30" aria-hidden="true">
              /
            </span>
            <Link
              to={`/category/${category.parent.slug}`}
              className="transition-colors hover:text-gold"
            >
              {pickText(category.parent.name, locale)}
            </Link>
          </>
        )}
      </nav>

      {loading && <p className="mt-8 font-sans text-sm text-ink/60">{t('common.loading')}</p>}

      {!loading && error && (
        <p role="alert" className="mt-8 font-sans text-sm text-gold-dark">
          {error}
        </p>
      )}

      {!loading && !error && category && (
        <>
          <header className="mt-6">
            {category.image ? (
              <div className="relative aspect-[16/6] overflow-hidden rounded-brand border border-line">
                <img
                  src={category.image.url}
                  alt={category.image.alt ?? pickText(category.name, locale)}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <span className="block h-px w-16 bg-gold" aria-hidden="true" />
            )}

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl text-ink sm:text-5xl">
                  {pickText(category.name, locale)}
                </h1>
                {pickText(category.description, locale) && (
                  <p className="mt-3 max-w-2xl text-ink/70">{pickText(category.description, locale)}</p>
                )}
              </div>

              {DRESSING_ROOM_SLUGS.has(slug) && (
                <button
                  type="button"
                  onClick={() => setDressingOpen(true)}
                  className="flex items-center gap-2 rounded-brand border border-gold px-5 py-2.5 font-sans text-xs uppercase tracking-[0.15em] text-gold transition-colors hover:bg-gold hover:text-cream-card"
                >
                  <span>✨</span>
                  <span>{t('dressing.button')}</span>
                </button>
              )}
            </div>

            {subcategories.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/50 me-2">
                  {t('category.subcategories')}:
                </span>
                <span className="rounded-full bg-gold px-3.5 py-1.5 font-sans text-xs font-medium text-cream-card shadow-sm">
                  {t('common.all')}
                </span>
                {subcategories.map((sub) => (
                  <Link
                    key={sub._id}
                    to={`/category/${sub.slug}`}
                    className="rounded-full border border-line bg-cream-card/70 px-3.5 py-1.5 font-sans text-xs text-ink/80 transition-colors hover:border-gold hover:text-gold"
                  >
                    {pickText(sub.name, locale)}
                  </Link>
                ))}
              </div>
            )}
          </header>

          <div className="mt-12">
            {products.length === 0 ? (
              <p className="font-sans text-sm text-ink/60">{t('category.empty')}</p>
            ) : (
              <SceneRenderer
                style={category.displayStyle ?? DEFAULT_DISPLAY_STYLE}
                products={products}
              />
            )}
          </div>

          <AnimatePresence>
            {dressingOpen && (
              <DressingRoomModal onClose={() => setDressingOpen(false)} />
            )}
          </AnimatePresence>
        </>
      )}
    </section>
  )
}
