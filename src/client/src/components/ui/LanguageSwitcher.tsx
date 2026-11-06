import { LOCALES, LOCALE_LABELS } from '@shared/constants/locales'
import { useApp } from '../../app/useApp'

/** Switches the active locale. Arabic is the default (RTL). */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useApp()

  return (
    <div
      role="group"
      aria-label={t('lang.label')}
      className="flex items-center rounded-brand border border-line p-0.5"
    >
      {LOCALES.map((item) => {
        const active = item === locale
        return (
          <button
            key={item}
            type="button"
            onClick={() => setLocale(item)}
            aria-pressed={active}
            title={LOCALE_LABELS[item]}
            className={`px-2 py-1 font-sans text-[0.65rem] uppercase tracking-[0.15em] transition-colors ${
              active ? 'bg-gold text-cream-card' : 'text-ink/70 hover:text-gold'
            }`}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}
