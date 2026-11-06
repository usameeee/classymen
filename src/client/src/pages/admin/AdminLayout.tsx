import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/useAuth'
import { Wordmark } from '../../components/brand/Wordmark'
import { ThemeToggle } from '../../components/ui/ThemeToggle'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/orders', label: 'Orders', end: false },
  { to: '/admin/coupons', label: 'Coupons', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
  { to: '/admin/products', label: 'Products', end: false },
]

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `border-b-2 pb-3 font-sans text-sm uppercase tracking-[0.15em] transition-colors ${
      isActive ? 'border-gold text-gold' : 'border-transparent text-ink/70 hover:text-gold'
    }`

  return (
    <div dir="ltr" className="flex min-h-screen flex-col bg-cream text-ink">
      <header className="border-b border-line bg-cream-card">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Wordmark compact />
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-gold">Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="hidden font-sans text-sm text-ink/70 sm:inline">{user?.name}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-brand border border-line px-4 py-2 font-sans text-xs uppercase tracking-[0.15em] text-ink/80 transition-colors hover:border-gold hover:text-gold"
            >
              Sign out
            </button>
          </div>
        </div>

        <nav className="mx-auto flex w-full max-w-6xl gap-8 px-4 sm:px-6">
          {NAV_ITEMS.map((item) => (
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

      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
          >
            View store
          </Link>
          <span className="font-sans text-xs text-ink/50">Classy Men Rim</span>
        </div>
      </footer>
    </div>
  )
}
