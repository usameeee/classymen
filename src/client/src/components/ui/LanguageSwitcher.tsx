import { LOCALES } from '@shared/constants/locales'
import { useApp } from '../../app/useApp'

const DISPLAY_LABELS: Record<string, string> = {
  ar: 'عربي',
  fr: 'FR',
  en: 'EN',
}

interface LanguageSwitcherProps {
  compact?: boolean
  className?: string
}

/** Switches the active locale. Arabic is the default (RTL). */
export function LanguageSwitcher({ compact = false, className = '' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useApp()

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className={`inline-flex items-center rounded-brand border border-gold/40 bg-cream/70 dark:bg-[#181410]/70 p-0.5 shadow-sm backdrop-blur ${className}`}
    >
      {LOCALES.map((item) => {
        const active = item === locale
        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            aria-pressed={active}
            className={`rounded-brand px-2.5 py-1 font-sans text-xs font-medium uppercase tracking-wider transition-all ${
              active
                ? 'bg-gold text-cream-card font-bold shadow-sm'
                : 'text-ink/70 hover:text-gold hover:bg-gold/10'
            }`}
          >
            {compact ? DISPLAY_LABELS[item] || item : DISPLAY_LABELS[item] || item}
          </button>
        )
      })}
    </div>
  )
}
