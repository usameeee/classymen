import { Link } from 'react-router-dom'
import { useApp } from '../app/useApp'
import { useCategories } from '../app/useCategories'
import { pickText } from '../lib/localized'
import { SeoHead } from '../components/seo/SeoHead'
import type { MessageKey } from '../i18n/dictionary'

const FALLBACK_CATEGORIES: { id: string; title: MessageKey; description: MessageKey }[] = [
  { id: 'daraa', title: 'categories.daraa', description: 'categories.daraa.desc' },
  { id: 'perfumes', title: 'categories.perfumes', description: 'categories.perfumes.desc' },
  { id: 'accessories', title: 'categories.accessories', description: 'categories.accessories.desc' },
]

function Hero() {
  const { t } = useApp()

  return (
    <section id="home" className="mx-auto w-full max-w-6xl px-4 pb-16 pt-20 sm:px-6 sm:pt-28">
      <p className="flex items-center gap-3 font-sans text-xs uppercase tracking-[0.35em] text-gold">
        <span className="h-px w-8 bg-gold" aria-hidden="true" />
        {t('hero.eyebrow')}
      </p>

      <h1 className="mt-6 font-display text-6xl text-ink sm:text-7xl">{t('hero.title')}</h1>
      <p className="mt-2 font-sans text-sm uppercase tracking-[0.4em] text-ink/60">
        Classy Men Rim
      </p>
      <p className="mt-6 max-w-lg text-lg text-ink/80">{t('hero.subtitle')}</p>

      <Link
        to="/catalog"
        className="mt-10 inline-flex rounded-brand bg-gold px-8 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark"
      >
        {t('hero.cta')}
      </Link>
    </section>
  )
}

function Collections() {
  const { t, locale } = useApp()
  const categories = useCategories()

  return (
    <section id="collections" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
      <h2 className="font-display text-3xl text-ink">{t('collections.title')}</h2>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.length > 0
          ? categories.map((category) => (
              <Link
                key={category._id}
                to={`/category/${category.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-brand border border-line bg-cream-card"
              >
                {category.image && (
                  <img
                    src={category.image.url}
                    alt={category.image.alt ?? pickText(category.name, locale)}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="font-display text-2xl text-white transition-colors group-hover:text-gold-light">
                    {pickText(category.name, locale)}
                  </h3>
                  {pickText(category.description, locale) && (
                    <p className="mt-2 line-clamp-2 text-sm text-white/80">
                      {pickText(category.description, locale)}
                    </p>
                  )}
                </div>
              </Link>
            ))
          : FALLBACK_CATEGORIES.map((category) => (
              <article
                key={category.id}
                id={category.id}
                className="scroll-mt-24 border border-line bg-cream-card p-6"
              >
                <h3 className="font-display text-xl text-gold">{t(category.title)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/70">{t(category.description)}</p>
              </article>
            ))}
      </div>
    </section>
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
      <Collections />
    </>
  )
}
