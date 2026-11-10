import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../app/useAuth'
import { useApp } from '../../app/useApp'
import { useToast } from '../../app/useToast'
import { SeoHead } from '../../components/seo/SeoHead'
import { AuthShell, GoldStitchDivider } from './AuthShell'

export function VerifyOtpPage() {
  const { t, locale } = useApp()
  const { verifyOtp, resendOtp, user } = useAuth()
  const { error: toastError, success: toastSuccess, luxury: toastLuxury } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialEmail = searchParams.get('email') || ''
  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [cooldown, setCooldown] = useState(60)

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true })
    }
  }, [user, navigate])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await verifyOtp(email.trim(), otp.trim())
      toastLuxury(
        locale === 'ar' ? 'تم التحقق بنجاح!' : locale === 'fr' ? 'E-mail vérifié !' : 'Email verified!',
        locale === 'ar' ? 'مرحباً بك في Classy Men Rim.' : locale === 'fr' ? 'Bienvenue chez Classy Men Rim.' : 'Welcome to Classy Men Rim.',
      )
      navigate('/', { replace: true })
    } catch (err) {
      toastError(t('common.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    if (cooldown > 0 || !email) return

    try {
      await resendOtp(email.trim(), locale)
      toastSuccess(t('auth.otpResent'))
      setCooldown(60)
    } catch (err) {
      toastError(t('common.error'), err instanceof Error ? err.message : undefined)
    }
  }

  const digits = [0, 1, 2, 3, 4, 5]

  return (
    <AuthShell
      title={t('auth.verifyOtpTitle')}
      subtitle={
        email
          ? `${t('auth.otpSentTo')} ${email}`
          : undefined
      }
    >
      <SeoHead title={t('auth.verifyOtpTitle')} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {!initialEmail && (
          <div>
            <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
              {t('auth.email')}
            </label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-brand border border-line bg-cream/40 px-3.5 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:bg-cream-card focus:outline-none"
            />
          </div>
        )}

        {/* Tactile 6-Cell OTP Input (Altın Dikişli 6 Haneli Hücreler) */}
        <div>
          <label className="block text-center font-sans text-xs uppercase tracking-[0.2em] text-ink/70">
            {t('auth.enterOtp')}
          </label>

          <div
            className="relative mt-4 flex cursor-text items-center justify-center gap-2 sm:gap-3"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Hidden real input for mobile and keyboard paste handling */}
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              autoFocus
              className="absolute inset-0 h-full w-full opacity-0"
              aria-label={t('auth.enterOtp')}
            />

            {/* Individual tactile brass cells */}
            {digits.map((i) => {
              const char = otp[i] || ''
              const isCurrent = i === otp.length
              return (
                <div
                  key={i}
                  className={`relative flex h-13 w-11 sm:h-14 sm:w-12 items-center justify-center rounded-brand border text-2xl font-mono transition-all duration-200 ${
                    char
                      ? 'border-gold bg-cream-card text-ink shadow-sm'
                      : isCurrent
                      ? 'border-gold/80 bg-gold/5 shadow-[0_0_12px_rgba(160,116,52,0.25)]'
                      : 'border-line/80 bg-cream/50 text-ink/40'
                  }`}
                >
                  {char ? (
                    <span className="font-semibold text-gold-dark dark:text-gold-light">{char}</span>
                  ) : isCurrent ? (
                    <span className="h-4 w-0.5 animate-pulse bg-gold" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-line" />
                  )}
                  {/* Subtle corner tailor tack */}
                  <span className="pointer-events-none absolute top-1 start-1 h-1 w-1 rounded-full bg-gold/30" />
                </div>
              )
            })}
          </div>
        </div>

        <GoldStitchDivider className="opacity-40" />

        <button
          type="submit"
          disabled={submitting || otp.length !== 6}
          className="group relative w-full overflow-hidden rounded-brand bg-gradient-to-r from-gold via-gold-light to-gold py-3.5 font-sans text-xs uppercase tracking-[0.25em] text-cream-card shadow-md transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-60 before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-[100%]"
        >
          <span className="relative z-10 flex items-center justify-center">
            {submitting ? t('common.loading') : t('auth.verifyButton')}
          </span>
        </button>
      </form>

      <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-line/60 pt-6 sm:flex-row">
        <button
          type="button"
          disabled={cooldown > 0}
          onClick={handleResend}
          className="font-sans text-xs text-gold transition-colors hover:text-gold-dark hover:underline disabled:opacity-50"
        >
          {cooldown > 0 ? `${t('auth.resendWait')} (${cooldown}s)` : t('auth.resendOtp')}
        </button>

        <Link
          to="/login"
          className="font-sans text-xs text-ink/70 transition-colors hover:text-gold"
        >
          {t('auth.signIn')} →
        </Link>
      </div>
    </AuthShell>
  )
}
