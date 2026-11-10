import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { DisplayStyle } from '@shared/constants/displayStyles'
import { useApp } from '../app/useApp'
import { SeoHead } from '../components/seo/SeoHead'
import { SceneRenderer } from '../scenes/SceneRenderer'
import { fetchProducts } from '../lib/catalog'
import type { Product } from '../lib/catalog'

function Hero() {
  const { t } = useApp()

  return (
    <section id="home" className="mx-auto w-full max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
      {/* ── Eyebrow: موريتانيا ── */}
      <div className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.35em] text-gold">
        <span className="h-px w-8 bg-gold" aria-hidden="true" />
        <span>{t('hero.eyebrow')}</span>
      </div>

      {/* ── Arabic Display Title: كلاسي ── */}
      <h1 className="mt-8 font-display text-6xl text-ink sm:text-7xl lg:text-8xl tracking-tight leading-tight pb-3 sm:pb-4">
        {t('hero.title')}
      </h1>

      {/* ── Distinct Latin Brandmark with Generous Spacing & Luxury Badge ── */}
      <div className="mt-6 sm:mt-8 flex items-center gap-3 font-sans text-xs sm:text-sm uppercase tracking-[0.35em] text-ink/70">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <span className="font-semibold text-gold-dark dark:text-gold-light">Classy Men Rim</span>
        <span className="text-ink/40">•</span>
        <span className="text-ink/50 text-[11px] tracking-[0.25em]">Nouakchott</span>
      </div>

      {/* ── Subtitle / Description ── */}
      <p className="mt-8 max-w-xl text-lg sm:text-xl text-ink/80 leading-relaxed font-text">
        {t('hero.subtitle')}
      </p>

      {/* ── CTA Button ── */}
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 rounded-brand bg-gradient-to-r from-gold via-gold-light to-gold px-8 py-3.5 font-sans text-xs sm:text-sm uppercase tracking-[0.22em] text-cream-card shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] font-bold"
        >
          <span>{t('hero.cta')}</span>
          <span>→</span>
        </Link>
      </div>
    </section>
  )
}

/**
 * Featured Showcase Dispatcher:
 * - Fetches all featured products across the store.
 * - Groups them strictly by their assigned scene `displayStyle` (set by admin per product).
 * - Renders each scene in a curated boutique order.
 */
function FeaturedShowcases() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    fetchProducts({ featured: true, limit: 100 })
      .then((res) => {
        if (!cancelled) {
          setFeaturedProducts(res.items)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeaturedProducts([])
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const showcases = useMemo(() => {
    const groups = new Map<DisplayStyle, Product[]>()

    for (const p of featuredProducts) {
      // Priority: product.displayStyle > product.category?.displayStyle > 'rail'
      const style = (p.displayStyle || p.category?.displayStyle || 'rail') as DisplayStyle
      if (!groups.has(style)) groups.set(style, [])
      groups.get(style)!.push(p)
    }

    // Curated showcase sequence on the homepage
    const SCENE_ORDER: DisplayStyle[] = ['rail', 'wardrobe', 'mannequin', 'cabinet', 'floating', 'shelf', 'stage-3d', 'grid-clean']

    return SCENE_ORDER.filter((style) => groups.has(style) && groups.get(style)!.length > 0).map((style) => ({
      style,
      products: groups.get(style)!,
    }))
  }, [featuredProducts])

  if (loading || showcases.length === 0) return null

  return (
    <div className="space-y-16 pb-16">
      {showcases.map(({ style, products }) => (
        <section key={style} className="relative w-full">
          <SceneRenderer style={style} products={products} />
        </section>
      ))}
    </div>
  )
}

export function HomePage() {
  const { t } = useApp()

  return (
    <>
      <SeoHead
        title={t('hero.title')}
        description={t('hero.subtitle')}
      />
      <Hero />
      <FeaturedShowcases />
    </>
  )
}
