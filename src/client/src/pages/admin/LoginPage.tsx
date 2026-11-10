import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../app/useAuth'
import { useApp } from '../../app/useApp'
import { ApiError } from '../../lib/api'
import { Wordmark } from '../../components/brand/Wordmark'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { hasRoleAtLeast } from '@shared/constants/roles'
import { LOCALE_DIRECTION } from '@shared/constants/locales'

export function LoginPage() {
  const { user, ready, login } = useAuth()
  const { t, locale } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const dir = LOCALE_DIRECTION[locale]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/admin'

  if (ready && user) {
    if (hasRoleAtLeast(user.role, 'admin')) {
      return <Navigate to={from} replace />
    }
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'))
      setSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-brand border border-line bg-cream px-4 py-3 font-sans text-sm text-ink outline-none transition-colors focus:border-gold'

  return (
    <div dir={dir} className="flex min-h-screen items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-sm">
        {/* Language & Theme Controls on top */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="font-sans text-xs text-ink/60 hover:text-gold transition-colors"
          >
            ← {t('admin.viewStore')}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <Wordmark />
          <p className="mt-4 font-sans text-xs uppercase tracking-[0.3em] text-gold font-bold">
            {t('admin.title')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-brand border border-line bg-cream-card p-6 shadow-lg"
        >
          <h1 className="font-display text-2xl text-ink">{t('auth.signIn')}</h1>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-brand border border-gold/40 bg-gold/10 p-3 font-sans text-xs text-gold-dark"
            >
              {error}
            </div>
          )}

          <label className="mt-6 block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
            {t('auth.email')}
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`mt-2 ${fieldClass}`}
            />
          </label>

          <label className="mt-4 block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
            {t('auth.password')}
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`mt-2 ${fieldClass}`}
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-brand bg-gold py-3.5 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow transition-colors hover:bg-gold-dark disabled:opacity-60 font-bold"
          >
            {submitting ? t('common.loading') : t('auth.signIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
