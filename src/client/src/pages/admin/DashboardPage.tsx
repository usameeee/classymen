import { Link } from 'react-router-dom'
import { USER_ROLE_LABELS } from '@shared/constants/roles'
import { useAuth } from '../../app/useAuth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">Dashboard</h1>
      <p className="mt-2 font-sans text-sm text-ink/70">
        Signed in as {user?.email} ({user ? USER_ROLE_LABELS[user.role] : ''}).
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/orders"
          className="group rounded-brand border border-line bg-cream-card p-6 transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold group-hover:text-gold-dark">Orders</h2>
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/40 group-hover:text-gold">
              Manage →
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            View customer purchases, WhatsApp inquiries and update delivery status.
          </p>
        </Link>

        <Link
          to="/admin/coupons"
          className="group rounded-brand border border-line bg-cream-card p-6 transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold group-hover:text-gold-dark">Coupons</h2>
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/40 group-hover:text-gold">
              Manage →
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Create discount vouchers, promo codes, and spin & win campaign rewards.
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="group rounded-brand border border-line bg-cream-card p-6 transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold group-hover:text-gold-dark">Categories</h2>
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/40 group-hover:text-gold">
              Manage →
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Organize catalog hierarchy, subcategories, and interactive scene presentation styles.
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="group rounded-brand border border-line bg-cream-card p-6 transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold group-hover:text-gold-dark">Products</h2>
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/40 group-hover:text-gold">
              Manage →
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            Manage men's garments, perfumes, accessories, sizing guides, and Cloudinary imagery.
          </p>
        </Link>
      </div>
    </div>
  )
}
