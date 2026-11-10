import { Link } from 'react-router-dom'
import type { MessageKey } from '../../i18n/dictionary'
import { useApp } from '../../app/useApp'
import { useCategories } from '../../app/useCategories'
import { pickText } from '../../lib/localized'
import { Wordmark } from '../brand/Wordmark'

const COMPANY_LINKS: { href: string; key: MessageKey }[] = [
  { href: '#', key: 'footer.about' },
  { href: '#', key: 'footer.shipping' },
  { href: '#', key: 'footer.returns' },
]

const CURRENT_YEAR = new Date().getFullYear()

export function Footer() {
  const { t, locale } = useApp()
  const categories = useCategories()

  const linkClass = 'font-sans text-sm text-ink/70 transition-colors hover:text-gold'
  const headingClass = 'font-sans text-xs uppercase tracking-[0.2em] text-gold'

  return (
    <footer id="contact" className="border-t border-line bg-cream-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm text-ink/70">{t('footer.tagline')}</p>
        </div>

        <div>
          <h3 className={headingClass}>{t('footer.shop')}</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link to="/catalog" className={linkClass}>
                {t('nav.catalog')}
              </Link>
            </li>
            {categories.map((category) => (
              <li key={category._id}>
                <Link to={`/category/${category.slug}`} className={linkClass}>
                  {pickText(category.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={headingClass}>{t('footer.company')}</h3>
          <ul className="mt-4 space-y-2">
            <li>
              <Link to="/login" className={linkClass}>
                {t('auth.account')} / {t('auth.signIn')}
              </Link>
            </li>
            {COMPANY_LINKS.map((link) => (
              <li key={link.key}>
                <a href={link.href} className={linkClass}>
                  {t(link.key)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 sm:flex-row sm:px-6">
          <p className="font-sans text-xs text-ink/60">
            &copy; {CURRENT_YEAR} Classy Men Rim. {t('footer.rights')}
          </p>
          <Link
            to="/catalog"
            className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
          >
            {t('footer.contact')}
          </Link>
        </div>
      </div>
    </footer>
  )
}
