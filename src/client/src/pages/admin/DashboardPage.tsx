import { Link } from 'react-router-dom'
import { USER_ROLE_LABELS } from '@shared/constants/roles'
import { useAuth } from '../../app/useAuth'
import { useApp } from '../../app/useApp'

export function DashboardPage() {
  const { user } = useAuth()
  const { t } = useApp()

  return (
    <div>
      <h1 className="font-display text-3xl text-ink">{t('admin.dashboard')}</h1>
      <p className="mt-2 font-sans text-sm text-ink/70">
        {user?.email} ({user ? USER_ROLE_LABELS[user.role] : ''})
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/admin/orders"
          className="group rounded-brand border border-line bg-cream-card p-6 transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold group-hover:text-gold-dark">{t('admin.orders')}</h2>
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/40 group-hover:text-gold">
              {t('admin.manage')}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {t('admin.ordersDesc')}
          </p>
        </Link>

        <Link
          to="/admin/coupons"
          className="group rounded-brand border border-line bg-cream-card p-6 transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold group-hover:text-gold-dark">{t('admin.coupons')}</h2>
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/40 group-hover:text-gold">
              {t('admin.manage')}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {t('admin.couponsDesc')}
          </p>
        </Link>

        <Link
          to="/admin/categories"
          className="group rounded-brand border border-line bg-cream-card p-6 transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold group-hover:text-gold-dark">{t('admin.categories')}</h2>
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/40 group-hover:text-gold">
              {t('admin.manage')}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {t('admin.categoriesDesc')}
          </p>
        </Link>

        <Link
          to="/admin/products"
          className="group rounded-brand border border-line bg-cream-card p-6 transition-colors hover:border-gold"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-gold group-hover:text-gold-dark">{t('admin.products')}</h2>
            <span className="font-sans text-xs uppercase tracking-[0.15em] text-ink/40 group-hover:text-gold">
              {t('admin.manage')}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-ink/70">
            {t('admin.productsDesc')}
          </p>
        </Link>
      </div>
    </div>
  )
}
