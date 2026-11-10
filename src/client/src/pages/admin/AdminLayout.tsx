import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/useAuth'
import { useApp } from '../../app/useApp'
import { Wordmark } from '../../components/brand/Wordmark'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { LOCALE_DIRECTION } from '@shared/constants/locales'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const { t, locale } = useApp()
  const navigate = useNavigate()
  const dir = LOCALE_DIRECTION[locale]

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const navItems = [
    { to: '/admin', label: t('admin.dashboard'), end: true },
    { to: '/admin/orders', label: t('admin.orders'), end: false },
    { to: '/admin/coupons', label: t('admin.coupons'), end: false },
    { to: '/admin/categories', label: t('admin.categories'), end: false },
    { to: '/admin/products', label: t('admin.products'), end: false },
  ]

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `border-b-2 pb-3 font-sans text-sm uppercase tracking-[0.15em] transition-colors ${
      isActive ? 'border-gold text-gold font-semibold' : 'border-transparent text-ink/70 hover:text-gold'
    }`

  return (
    <div dir={dir} className="flex min-h-screen flex-col bg-cream text-ink">
      <header className="border-b border-line bg-cream-card shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Link to="/" title={t('admin.viewStore')}>
              <Wordmark compact />
            </Link>
            <span className="rounded border border-gold/40 bg-gold/15 px-2 py-0.5 font-sans text-xs uppercase tracking-[0.2em] text-gold-dark dark:text-gold-light font-bold">
              {t('admin.title')}
            </span>
            <Link
              to="/"
              className="hidden font-sans text-xs text-ink/60 hover:text-gold transition-colors sm:inline"
            >
              ← {t('admin.viewStore')}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher in Admin Panel */}
            <LanguageSwitcher />
            <ThemeToggle />
            <span className="hidden font-sans text-sm text-ink/80 font-medium sm:inline">
              {user?.name}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-brand border border-line px-3.5 py-1.5 font-sans text-xs uppercase tracking-[0.15em] text-ink/80 transition-colors hover:border-red-400 hover:text-red-500"
            >
              {t('auth.signOut')}
            </button>
          </div>
        </div>

        <nav className="mx-auto flex w-full max-w-6xl gap-8 overflow-x-auto px-4 sm:px-6">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navItemClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
