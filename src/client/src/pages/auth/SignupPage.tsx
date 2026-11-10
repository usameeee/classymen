import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../app/useAuth'
import { useApp } from '../../app/useApp'
import { useToast } from '../../app/useToast'
import { SeoHead } from '../../components/seo/SeoHead'
import { AuthShell, GoldStitchDivider } from './AuthShell'

export function SignupPage() {
  const { t, locale } = useApp()
  const { signup, logout, user } = useAuth()
  const { error: toastError, luxury: toastLuxury } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return (
      <AuthShell
        title={t('auth.signUp')}
        subtitle={`${user.name} (${user.email})`}
      >
        <SeoHead title={t('auth.signUp')} />
        <div className="text-center py-4 space-y-6">
          <div className="rounded-brand border border-gold/40 bg-gold/10 p-4 font-sans text-xs text-gold-dark leading-relaxed">
            <p className="font-semibold">{user.name}</p>
            <p className="text-ink/70 mt-1">{user.email}</p>
            <p className="mt-2 text-gold-dark font-medium">
              {locale === 'ar'
                ? 'أنت مسجل الدخول بالفعل بهذا الحساب.'
                : locale === 'fr'
                ? 'Vous êtes déjà connecté avec ce compte.'
                : 'You are already signed in with this account.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow hover:bg-gold-dark transition-colors"
            >
              {locale === 'ar' ? 'متابعة التسوق' : locale === 'fr' ? 'Continuer mes achats' : 'Continue Shopping'}
            </button>
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        locale,
      })
      toastLuxury(
        locale === 'ar' ? 'تم إنشاء حسابك بنجاح' : locale === 'fr' ? 'Compte créé avec succès' : 'Account created!',
        locale === 'ar' ? 'تحقق من بريدك الإلكتروني لإكمال التسجيل.' : locale === 'fr' ? 'Vérifiez votre e-mail.' : 'Please verify your email.',
        6000,
      )
      navigate(`/verify-otp?email=${encodeURIComponent(email.trim())}`)
    } catch (err) {
      toastError(t('common.error'), err instanceof Error ? err.message : undefined)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title={t('auth.signUp')}
      subtitle={t('auth.needAccount')}
    >
      <SeoHead title={t('auth.signUp')} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
            {t('auth.name')}
          </label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ahmed Salem"
            className="mt-2 w-full rounded-brand border border-line bg-cream/40 px-3.5 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:bg-cream-card focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
            {t('auth.email')}
          </label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ahmed@example.com"
            className="mt-2 w-full rounded-brand border border-line bg-cream/40 px-3.5 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:bg-cream-card focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
            {t('auth.phone')}
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+222 45 00 00 00"
            className="mt-2 w-full rounded-brand border border-line bg-cream/40 px-3.5 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:bg-cream-card focus:outline-none"
          />
        </div>

        <div>
          <label className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/70">
            {t('auth.password')}
          </label>
          <input
            required
            type="password"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-brand border border-line bg-cream/40 px-3.5 py-3 font-sans text-sm text-ink transition-colors placeholder:text-ink/30 focus:border-gold focus:bg-cream-card focus:outline-none"
          />
        </div>

        <GoldStitchDivider className="opacity-40" />

        <button
          type="submit"
          disabled={submitting}
          className="group relative w-full overflow-hidden rounded-brand bg-gradient-to-r from-gold via-gold-light to-gold py-3.5 font-sans text-xs uppercase tracking-[0.25em] text-cream-card shadow-md transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-60 before:absolute before:inset-0 before:translate-x-[-100%] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-transform before:duration-700 hover:before:translate-x-[100%]"
        >
          <span className="relative z-10 flex items-center justify-center">
            {submitting ? t('common.loading') : t('auth.signUp')}
          </span>
        </button>
      </form>

      <div className="mt-8 border-t border-line/60 pt-6 text-center">
        <p className="font-text text-sm text-ink/70">
          <Link
            to="/login"
            className="font-sans font-medium text-gold transition-colors hover:text-gold-dark hover:underline"
          >
            {t('auth.haveAccount')} →
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
