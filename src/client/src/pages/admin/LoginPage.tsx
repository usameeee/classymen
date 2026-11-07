import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../app/useAuth'
import { ApiError } from '../../lib/api'
import { Wordmark } from '../../components/brand/Wordmark'

import { hasRoleAtLeast } from '@shared/constants/roles'

export function LoginPage() {
  const { user, ready, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const fieldClass =
    'w-full rounded-brand border border-line bg-cream px-4 py-3 font-sans text-sm text-ink outline-none transition-colors focus:border-gold'

  return (
    <div dir="ltr" className="flex min-h-screen items-center justify-center bg-cream px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center">
          <Wordmark />
          <p className="mt-4 font-sans text-xs uppercase tracking-[0.3em] text-gold">
            Admin Panel
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-brand border border-line bg-cream-card p-6"
        >
          <h1 className="font-display text-2xl text-ink">Sign in</h1>

          <label className="mt-6 block">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              required
              className={`mt-2 ${fieldClass}`}
            />
          </label>

          <label className="mt-4 block">
            <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className={`mt-2 ${fieldClass}`}
            />
          </label>

          {error && (
            <p role="alert" className="mt-4 font-sans text-sm text-gold-dark">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-brand bg-gold px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link
            to="/"
            className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
          >
            Back to store
          </Link>
        </p>
      </div>
    </div>
  )
}
