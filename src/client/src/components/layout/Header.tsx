import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import type { MessageKey } from '../../i18n/dictionary'
import { useApp } from '../../app/useApp'
import { useAuth } from '../../app/useAuth'
import { useCart } from '../../app/useCart'
import { hasRoleAtLeast } from '@shared/constants/roles'
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
  { to: '/catalog', key: 'collections.title' },
]

export function Header() {
  const { t } = useApp()
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [open, setOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  // Primary navigation: only Home and Collections
  const items: NavItem[] = BASE_LINKS.map((link) => ({
    to: link.to,
    label: t(link.key),
    end: link.end,
  }))

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `font-sans text-sm uppercase tracking-[0.15em] transition-colors ${
      isActive ? 'text-gold' : 'text-ink/80 hover:text-gold'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      {/* Admin Quick Action Top Bar (Yönetici Hızlı Erişim Çubuğu) */}
      {user && hasRoleAtLeast(user.role, 'admin') && (
        <div className="border-b border-gold/30 bg-[#16130f] px-4 py-1.5 font-sans text-xs text-gold">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-cream-card">{user.name}</span>
              <span className="rounded border border-gold/40 bg-gold/20 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-gold-light">
                {user.role}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-medium">
              <Link to="/admin" className="text-ink-light/80 hover:text-gold transition-colors">
                Dashboard
              </Link>
              <Link to="/admin/orders" className="text-ink-light/80 hover:text-gold transition-colors">
                Orders
              </Link>
              <Link to="/admin/products" className="text-ink-light/80 hover:text-gold transition-colors">
                Products
              </Link>
              <Link to="/admin/coupons" className="text-ink-light/80 hover:text-gold transition-colors">
                Coupons
              </Link>
              <Link
                to="/admin"
                className="rounded border border-gold bg-gold px-2.5 py-0.5 font-bold text-cream-card shadow hover:bg-gold-dark transition-colors"
              >
                {t('auth.adminPanel')} →
              </Link>
            </div>
          </div>
        </div>
      )}

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

          {/* User Account / Auth Button */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-brand border border-gold/60 bg-gold/5 px-3 py-1.5 font-sans text-xs uppercase tracking-[0.1em] text-gold-dark dark:text-gold-light transition-all hover:border-gold hover:bg-gold/10"
                aria-label={t('auth.account')}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </button>

              {accountMenuOpen && (
                <div
                  className="absolute end-0 mt-2 w-48 rounded-brand border border-line bg-cream-card p-2 shadow-xl z-50"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  <div className="border-b border-line px-3 py-2">
                    <p className="font-sans text-xs font-bold text-ink truncate">{user.name}</p>
                    <p className="font-sans text-[11px] text-ink/50 truncate">{user.email}</p>
                  </div>
                  {hasRoleAtLeast(user.role, 'admin') && (
                    <Link
                      to="/admin"
                      className="block rounded px-3 py-2 text-xs font-sans text-gold hover:bg-cream"
                    >
                      {t('auth.adminPanel')} →
                    </Link>
                  )}
                  <Link
                    to="/login"
                    className="block rounded px-3 py-2 text-xs font-sans text-ink/80 hover:bg-cream"
                  >
                    {t('auth.account')}
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full text-start rounded px-3 py-2 text-xs font-sans text-red-500 hover:bg-cream"
                  >
                    {t('auth.signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-brand border border-gold/70 bg-gold/10 px-3 py-1.5 font-sans text-xs font-medium uppercase tracking-[0.1em] text-gold-dark dark:text-gold-light shadow-sm transition-all hover:bg-gold hover:text-cream-card"
              aria-label={t('auth.signIn')}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>{t('auth.signIn')}</span>
            </Link>
          )}

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

            <div className="border-t border-line/60 py-3">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-semibold text-ink">
                      {user.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false)
                        logout()
                      }}
                      className="font-sans text-xs text-red-500 hover:underline"
                    >
                      {t('auth.signOut')}
                    </button>
                  </div>
                  {hasRoleAtLeast(user.role, 'admin') && (
                    <Link
                      to="/admin"
                      onClick={() => setOpen(false)}
                      className="block w-full text-center rounded-brand bg-gold py-2.5 font-sans text-xs uppercase tracking-[0.2em] font-bold text-cream-card shadow hover:bg-gold-dark"
                    >
                      {t('auth.adminPanel')} →
                    </Link>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="font-sans text-sm uppercase tracking-[0.15em] text-gold"
                >
                  {t('auth.signIn')} / {t('auth.signUp')}
                </Link>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  )
}
