import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { hasRoleAtLeast } from '@shared/constants/roles'
import { useAuth } from '../../app/useAuth'
import { useApp } from '../../app/useApp'
import { useToast } from '../../app/useToast'
import { SeoHead } from '../../components/seo/SeoHead'
import { ApiError } from '../../lib/api'
import { AuthShell, GoldStitchDivider } from './AuthShell'

export function LoginPage() {
  const { t, locale } = useApp()
  const { login, logout, user } = useAuth()
  const { error: toastError, luxury: toastLuxury } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const loggedUser = await login(email, password)
      if (hasRoleAtLeast(loggedUser.role, 'admin')) {
        toastLuxury(
          locale === 'ar' ? 'مرحباً بك في لوحة الإدارة' : locale === 'fr' ? 'Bienvenue dans le panneau admin' : 'Welcome to Admin Panel',
          loggedUser.name,
        )
        navigate('/admin', { replace: true })
      } else {
        toastLuxury(
          locale === 'ar' ? 'أهلاً وسهلاً' : locale === 'fr' ? 'Bienvenue' : 'Welcome back',
          loggedUser.name,
        )
        navigate(from, { replace: true })
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === 'UNVERIFIED_EMAIL') {
        const targetEmail = err.email || email
        navigate(`/verify-otp?email=${encodeURIComponent(targetEmail)}`)
      } else {
        toastError(
          t('common.error'),
          err instanceof Error ? err.message : undefined,
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  // If already logged in, provide clear feedback instead of an abrupt redirect loop
  if (user) {
    const isAdmin = hasRoleAtLeast(user.role, 'admin')

    return (
      <AuthShell
        title={isAdmin ? (locale === 'ar' ? 'جلسة الإدارة' : 'Admin Session') : t('auth.signIn')}
        subtitle={`${user.name} (${user.email})`}
      >
        <SeoHead title={isAdmin ? 'Admin' : t('auth.signIn')} />
        <div className="text-center py-4 space-y-6">
          <div className="rounded-brand border border-gold/40 bg-gold/10 p-4 font-sans text-xs text-gold-dark leading-relaxed">
            <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
              <span>{user.name}</span>
              <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-gold text-cream-card tracking-wider">
                {user.role}
              </span>
            </div>
            <p className="text-ink/70 mt-1">{user.email}</p>
            <p className="mt-2 text-gold-dark font-medium">
              {isAdmin
                ? (locale === 'ar'
                    ? 'أنت مسجل الدخول بصلاحيات مدير النظام (Admin).'
                    : locale === 'fr'
                    ? 'Vous êtes connecté avec les privilèges Administrateur.'
                    : 'You are signed in with Administrator privileges.')
                : (locale === 'ar'
                    ? 'أنت مسجل الدخول بالفعل بهذا الحساب.'
                    : locale === 'fr'
                    ? 'Vous êtes déjà connecté avec ce compte.'
                    : 'You are already signed in with this account.')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className="flex-1 rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow hover:bg-gold-dark transition-colors font-bold"
              >
                {t('auth.adminPanel')} →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow hover:bg-gold-dark transition-colors"
              >
                {locale === 'ar' ? 'متابعة التسوق' : locale === 'fr' ? 'Continuer mes achats' : 'Continue Shopping'}
              </button>
            )}
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 rounded-brand border border-line py-3 font-sans text-xs uppercase tracking-[0.2em] text-red-500 hover:border-red-400 transition-colors"
            >
              {t('auth.signOut')}
            </button>
          </div>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title={t('auth.signIn')}
      subtitle={t('auth.haveAccount')}
    >
      <SeoHead title={t('auth.signIn')} />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
            {t('auth.email')}
          </label>
          <div className="relative mt-2">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usame@example.com"
              className="w-full rounded-brand border border-line bg-cream/40 px-3.5 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:bg-cream-card focus:outline-none"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
              {t('auth.password')}
            </label>
            <Link
              to="/forgot-password"
              className="font-sans text-xs text-gold transition-colors hover:text-gold-dark hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <div className="relative mt-2">
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-brand border border-line bg-cream/40 px-3.5 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:bg-cream-card focus:outline-none"
            />
          </div>
        </div>

        <GoldStitchDivider className="opacity-40" />

        <button
          type="submit"
          disabled={submitting}
          className="group relative w-full overflow-hidden rounded-brand bg-gradient-to-r from-gold via-gold-light to-gold py-3.5 font-sans text-xs uppercase tracking-[0.25em] text-cream-card shadow-md transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-60 before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-[100%]"
        >
          <span className="relative z-10 flex items-center justify-center">
            {submitting ? t('common.loading') : t('auth.signIn')}
          </span>
        </button>
      </form>

      <div className="mt-8 border-t border-line/60 pt-6 text-center">
        <p className="font-text text-sm text-ink/70">
          <Link
            to="/signup"
            className="font-sans font-medium text-gold transition-colors hover:text-gold-dark hover:underline"
          >
            {t('auth.needAccount')} →
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
