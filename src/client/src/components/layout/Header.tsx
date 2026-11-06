import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { MessageKey } from '../../i18n/dictionary'
import { useApp } from '../../app/useApp'
import { useCart } from '../../app/useCart'
import { useCategories } from '../../app/useCategories'
import { pickText } from '../../lib/localized'
import { Wordmark } from '../brand/Wordmark'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { ThemeToggle } from '../ui/ThemeToggle'

interface NavItem {
  to: string
  label: string
  end?: boolean
}

const BASE_LINKS: { to: string; key: MessageKey; end?: boolean }[] = [
  { to: '/', key: 'nav.home', end: true },
  { to: '/catalog', key: 'nav.catalog' },
]

export function Header() {
  const { t, locale } = useApp()
  const { count } = useCart()
  const categories = useCategories()
  const [open, setOpen] = useState(false)

  // Show top-level categories in primary navigation to keep header balanced
  const rootCategories = categories.filter((cat) => !cat.parent)
  const displayCategories = rootCategories.length > 0 ? rootCategories : categories

  const items: NavItem[] = [
    ...BASE_LINKS.map((link) => ({ to: link.to, label: t(link.key), end: link.end })),
    ...displayCategories.map((category) => ({
      to: `/category/${category.slug}`,
      label: pickText(category.name, locale),
    })),
  ]

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `font-sans text-sm uppercase tracking-[0.15em] transition-colors ${
      isActive ? 'text-gold' : 'text-ink/80 hover:text-gold'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link to="/" className="shrink-0" aria-label="Classy Men Rim">
          <Wordmark compact />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          <Link
            to="/cart"
            aria-label={t('cart.title')}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-brand border border-line text-ink/80 transition-colors hover:border-gold hover:text-gold"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2l1.5 3M6 2H3.5M6 2h14l-1.5 12H7.5L6 2zM7.5 14h11" />
              <circle cx="9" cy="20" r="1.2" />
              <circle cx="17" cy="20" r="1.2" />
            </svg>
            {count > 0 && (
              <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 font-sans text-[10px] leading-none text-cream-card">
                {count}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={open ? t('menu.close') : t('menu.open')}
            className="inline-flex h-9 w-9 items-center justify-center rounded-brand border border-line text-ink/80 transition-colors hover:border-gold hover:text-gold md:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line bg-cream md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col px-4 sm:px-6">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `border-b border-line/60 py-3 font-sans text-sm uppercase tracking-[0.15em] transition-colors last:border-b-0 ${
                    isActive ? 'text-gold' : 'text-ink/80 hover:text-gold'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
