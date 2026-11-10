/**
 * Toast.tsx — Luxury animated toast notifications & inline Alert component
 *
 * Variants:
 *   success  — emerald accent
 *   error    — crimson / warm red
 *   warning  — amber
 *   info     — cool indigo/slate
 *   luxury   — full gold brand treatment (promos, achievements)
 *
 * Usage:
 *   const { success, error, luxury } = useToast()
 *   success('Sepete eklendi!')
 *   error('Bir hata oluştu.', 'Lütfen daha sonra tekrar deneyin.')
 *   luxury('Kupon uygulandı!', '%15 indirim sepetinize yansıdı.')
 */

import { type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Toast, ToastVariant } from '../../app/ToastContext'

// ─── Variant Configuration ───────────────────────────────────────────────────

interface VariantConfig {
  bar: string         // left accent bar colour
  bg: string          // card background (light/dark)
  border: string      // border colour
  iconBg: string      // icon badge background
  iconStroke: string  // SVG stroke colour
  title: string       // text colour for message
  detail: string      // text colour for detail
  icon: ReactNode
}

function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function LuxuryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

const VARIANT: Record<ToastVariant, VariantConfig> = {
  success: {
    bar:         'bg-emerald-500',
    bg:          'bg-cream-card dark:bg-[#161210]',
    border:      'border-emerald-400/40',
    iconBg:      'bg-emerald-50 dark:bg-emerald-900/30',
    iconStroke:  'text-emerald-600 dark:text-emerald-400',
    title:       'text-ink dark:text-cream-card',
    detail:      'text-ink/60 dark:text-cream-card/50',
    icon:        <SuccessIcon />,
  },
  error: {
    bar:         'bg-red-500',
    bg:          'bg-cream-card dark:bg-[#161210]',
    border:      'border-red-400/40',
    iconBg:      'bg-red-50 dark:bg-red-900/30',
    iconStroke:  'text-red-600 dark:text-red-400',
    title:       'text-ink dark:text-cream-card',
    detail:      'text-ink/60 dark:text-cream-card/50',
    icon:        <ErrorIcon />,
  },
  warning: {
    bar:         'bg-amber-400',
    bg:          'bg-cream-card dark:bg-[#161210]',
    border:      'border-amber-400/40',
    iconBg:      'bg-amber-50 dark:bg-amber-900/30',
    iconStroke:  'text-amber-600 dark:text-amber-400',
    title:       'text-ink dark:text-cream-card',
    detail:      'text-ink/60 dark:text-cream-card/50',
    icon:        <WarningIcon />,
  },
  info: {
    bar:         'bg-indigo-400',
    bg:          'bg-cream-card dark:bg-[#161210]',
    border:      'border-indigo-400/40',
    iconBg:      'bg-indigo-50 dark:bg-indigo-900/30',
    iconStroke:  'text-indigo-600 dark:text-indigo-400',
    title:       'text-ink dark:text-cream-card',
    detail:      'text-ink/60 dark:text-cream-card/50',
    icon:        <InfoIcon />,
  },
  luxury: {
    bar:         'bg-gradient-to-b from-[#fff3d1] via-gold to-[#5a3d13]',
    bg:          'bg-[#100d0a] dark:bg-[#0d0b08]',
    border:      'border-gold/60',
    iconBg:      'bg-gold/20',
    iconStroke:  'text-gold',
    title:       'text-cream-card',
    detail:      'text-cream-card/60',
    icon:        <LuxuryIcon />,
  },
}

// ─── Single Toast Card ────────────────────────────────────────────────────────

interface ToastCardProps {
  toast: Toast
  dismiss: (id: string) => void
}

function ToastCard({ toast, dismiss }: ToastCardProps) {
  const v = VARIANT[toast.variant]

  return (
    <motion.div
      layout
      key={toast.id}
      initial={{ opacity: 0, x: 60, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      role="alert"
      aria-live="polite"
      className={`
        relative flex w-80 items-start gap-3 overflow-hidden rounded-brand
        border ${v.border} ${v.bg}
        p-4 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-md
      `}
    >
      {/* Left accent bar */}
      <span className={`absolute start-0 inset-y-0 w-[3px] rounded-s-brand ${v.bar}`} />

      {/* Icon badge */}
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${v.iconBg} ${v.iconStroke}`}>
        {v.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 ps-0.5">
        <p className={`font-sans text-sm font-semibold leading-snug ${v.title}`}>
          {toast.message}
        </p>
        {toast.detail && (
          <p className={`mt-0.5 font-sans text-xs leading-relaxed ${v.detail}`}>
            {toast.detail}
          </p>
        )}

        {/* Luxury brand marquee line */}
        {toast.variant === 'luxury' && (
          <p className="mt-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-gold/60">
            Classy Men Rim · نواكشوط
          </p>
        )}
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        aria-label="Kapat"
        className="mt-0.5 shrink-0 rounded p-0.5 text-current opacity-40 transition-opacity hover:opacity-80"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Auto-dismiss progress bar */}
      {toast.duration && toast.duration > 0 && (
        <motion.span
          className={`absolute bottom-0 start-0 h-[2px] ${toast.variant === 'luxury' ? 'bg-gold/60' : v.bar} opacity-50`}
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

// ─── Toast Stack (Portal-like fixed container) ────────────────────────────────

interface ToastStackProps {
  toasts: Toast[]
  dismiss: (id: string) => void
}

export function ToastStack({ toasts, dismiss }: ToastStackProps) {
  return (
    <div
      aria-label="Bildirimler"
      className="fixed end-4 top-4 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastCard toast={t} dismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Inline Alert ─────────────────────────────────────────────────────────────

export type AlertVariant = ToastVariant

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
  /** Show close button */
  dismissible?: boolean
  onDismiss?: () => void
}

/**
 * Inline block-level alert for forms, page sections, etc.
 *
 * <Alert variant="error" title="Hata">Şifre en az 8 karakter olmalı.</Alert>
 * <Alert variant="luxury" title="Tebrikler!">Kuponunuz uygulandı.</Alert>
 */
export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  dismissible = false,
  onDismiss,
}: AlertProps) {
  const v = VARIANT[variant]

  return (
    <div
      role="alert"
      className={`
        relative flex items-start gap-3 overflow-hidden rounded-brand
        border ${v.border} ${v.bg}
        p-4 ${className}
      `}
    >
      {/* Left bar */}
      <span className={`absolute start-0 inset-y-0 w-[3px] rounded-s-brand ${v.bar}`} />

      {/* Icon */}
      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${v.iconBg} ${v.iconStroke}`}>
        {v.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 ps-0.5">
        {title && (
          <p className={`font-sans text-sm font-bold leading-snug mb-0.5 ${v.title}`}>{title}</p>
        )}
        <div className={`font-sans text-sm leading-relaxed ${title ? v.detail : v.title}`}>
          {children}
        </div>

        {variant === 'luxury' && (
          <p className="mt-1.5 font-sans text-[10px] uppercase tracking-[0.2em] text-gold/60">
            Classy Men Rim · نواكشوط
          </p>
        )}
      </div>

      {/* Dismiss */}
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Kapat"
          className="mt-0.5 shrink-0 rounded p-0.5 text-current opacity-40 transition-opacity hover:opacity-80"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

