import { useEffect, useId, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../app/useAuth'
import { useApp } from '../../app/useApp'
import { ApiError } from '../../lib/api'

export type AuthMode = 'login' | 'signup' | 'verify-otp' | 'forgot-password' | 'reset-password'

interface AuthModalProps {
  initialMode?: AuthMode
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ initialMode = 'login', onClose, onSuccess }: AuthModalProps) {
  const { t, locale } = useApp()
  const { login, signup, verifyOtp, resendOtp, forgotPassword, resetPassword } = useAuth()
  const backdropId = useId()

  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Reset error when switching mode
  function switchMode(newMode: AuthMode) {
    setMode(newMode)
    setError(null)
    setSuccessMsg(null)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      onSuccess?.()
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'UNVERIFIED_EMAIL') {
        setEmail(err.email ?? email)
        switchMode('verify-otp')
        setSuccessMsg(t('auth.otpSentTo') + ` ${email}`)
      } else {
        setError(err instanceof Error ? err.message : t('common.error'))
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signup({ name, email, password, phone, locale })
      setCooldown(60)
      switchMode('verify-otp')
      setSuccessMsg(t('auth.otpSentTo') + ` ${email}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError(t('auth.enterOtp'))
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await verifyOtp(email, otp)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendOtp() {
    if (cooldown > 0) return
    setError(null)
    setSubmitting(true)
    try {
      await resendOtp(email, locale)
      setCooldown(60)
      setSuccessMsg(t('auth.otpSentTo') + ` ${email}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await forgotPassword(email, locale)
      setCooldown(60)
      switchMode('reset-password')
      setSuccessMsg(t('auth.otpSentTo') + ` ${email}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (otp.length !== 6) {
      setError(t('auth.enterOtp'))
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await resetPassword(email, otp, newPassword)
      switchMode('login')
      setSuccessMsg(t('auth.resetPasswordTitle') + ' ✓')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      id={backdropId}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === backdropId && !submitting) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-md overflow-hidden rounded-brand border border-gold/40 bg-cream-card p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label={t('menu.close')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-line hover:text-ink disabled:opacity-30"
        >
          ✕
        </button>

        {/* Brand header */}
        <div className="text-center">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold">Classy Men Rim</p>
          <h2 className="mt-1 font-display text-2xl text-ink">
            {mode === 'login' && t('auth.signIn')}
            {mode === 'signup' && t('auth.signUp')}
            {mode === 'verify-otp' && t('auth.verifyOtpTitle')}
            {mode === 'forgot-password' && t('auth.forgotPassword')}
            {mode === 'reset-password' && t('auth.resetPasswordTitle')}
          </h2>
        </div>

        {/* Navigation tabs between Login / Signup */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="mt-6 flex border-b border-line">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 pb-3 text-center font-sans text-xs uppercase tracking-[0.15em] transition-colors ${
                mode === 'login'
                  ? 'border-b-2 border-gold text-gold font-bold'
                  : 'text-ink/50 hover:text-ink'
              }`}
            >
              {t('auth.signIn')}
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 pb-3 text-center font-sans text-xs uppercase tracking-[0.15em] transition-colors ${
                mode === 'signup'
                  ? 'border-b-2 border-gold text-gold font-bold'
                  : 'text-ink/50 hover:text-ink'
              }`}
            >
              {t('auth.signUp')}
            </button>
          </div>
        )}

        {/* Error and Success Feedback */}
        {error && (
          <div role="alert" className="mt-4 rounded-brand border border-gold/40 bg-gold/10 p-3 font-sans text-xs text-gold-dark">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mt-4 rounded-brand border border-green-600/30 bg-green-500/10 p-3 font-sans text-xs text-green-700 dark:text-green-300">
            {successMsg}
          </div>
        )}

        {/* Content depending on Mode */}
        <div className="mt-6">
          <AnimatePresence mode="wait">
            {/* 1. LOGIN */}
            {mode === 'login' && (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.email')}
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                      {t('auth.password')}
                    </label>
                    <button
                      type="button"
                      onClick={() => switchMode('forgot-password')}
                      className="font-sans text-[11px] text-gold hover:underline"
                    >
                      {t('auth.forgotPassword')}
                    </button>
                  </div>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow transition-colors hover:bg-gold-dark disabled:opacity-60"
                >
                  {submitting ? t('common.loading') : t('auth.signIn')}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-sans text-xs text-ink/60 hover:text-gold"
                  >
                    {t('auth.needAccount')}
                  </button>
                </div>
              </motion.form>
            )}

            {/* 2. SIGNUP */}
            {mode === 'signup' && (
              <motion.form
                key="signup"
                onSubmit={handleSignup}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.name')}
                  </label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.email')}
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.phone')}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.password')}
                  </label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow transition-colors hover:bg-gold-dark disabled:opacity-60"
                >
                  {submitting ? t('common.loading') : t('auth.signUp')}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-sans text-xs text-ink/60 hover:text-gold"
                  >
                    {t('auth.haveAccount')}
                  </button>
                </div>
              </motion.form>
            )}

            {/* 3. VERIFY OTP */}
            {mode === 'verify-otp' && (
              <motion.form
                key="verify-otp"
                onSubmit={handleVerifyOtp}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-5"
              >
                <p className="text-center font-sans text-xs text-ink/70">
                  {t('auth.otpSentTo')} <strong className="text-ink">{email}</strong>
                </p>

                <div>
                  <label className="block text-center font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.enterOtp')}
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="mt-2 w-full rounded-brand border border-gold/60 bg-transparent py-3 text-center font-mono text-2xl font-bold tracking-[0.5em] text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otp.length !== 6}
                  className="w-full rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow transition-colors hover:bg-gold-dark disabled:opacity-60"
                >
                  {submitting ? t('common.loading') : t('auth.verifyButton')}
                </button>

                <div className="flex items-center justify-between font-sans text-xs text-ink/60">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="hover:text-gold"
                  >
                    ← {t('auth.signIn')}
                  </button>
                  <button
                    type="button"
                    disabled={cooldown > 0 || submitting}
                    onClick={handleResendOtp}
                    className="text-gold hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {cooldown > 0 ? `${t('auth.resendWait')} (${cooldown}s)` : t('auth.resendOtp')}
                  </button>
                </div>
              </motion.form>
            )}

            {/* 4. FORGOT PASSWORD */}
            {mode === 'forgot-password' && (
              <motion.form
                key="forgot"
                onSubmit={handleForgotPassword}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div>
                  <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.email')}
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow transition-colors hover:bg-gold-dark disabled:opacity-60"
                >
                  {submitting ? t('common.loading') : t('auth.sendResetCode')}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-sans text-xs text-ink/60 hover:text-gold"
                  >
                    ← {t('auth.signIn')}
                  </button>
                </div>
              </motion.form>
            )}

            {/* 5. RESET PASSWORD */}
            {mode === 'reset-password' && (
              <motion.form
                key="reset"
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                <p className="text-center font-sans text-xs text-ink/70">
                  {t('auth.otpSentTo')} <strong className="text-ink">{email}</strong>
                </p>

                <div>
                  <label className="block text-center font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.enterOtp')}
                  </label>
                  <input
                    required
                    type="text"
                    maxLength={6}
                    autoFocus
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    className="mt-1.5 w-full rounded-brand border border-gold/60 bg-transparent py-2.5 text-center font-mono text-xl font-bold tracking-[0.4em] text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                    {t('auth.newPassword')}
                  </label>
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 w-full rounded-brand border border-line bg-transparent px-3 py-2.5 font-sans text-sm text-ink focus:border-gold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || otp.length !== 6}
                  className="w-full rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow transition-colors hover:bg-gold-dark disabled:opacity-60"
                >
                  {submitting ? t('common.loading') : t('auth.resetPasswordButton')}
                </button>

                <div className="flex items-center justify-between font-sans text-xs text-ink/60 pt-2">
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="hover:text-gold"
                  >
                    ← {t('auth.signIn')}
                  </button>
                  <button
                    type="button"
                    disabled={cooldown > 0 || submitting}
                    onClick={handleResendOtp}
                    className="text-gold hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {cooldown > 0 ? `${t('auth.resendWait')} (${cooldown}s)` : t('auth.resendOtp')}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
