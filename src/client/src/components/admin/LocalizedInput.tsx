import { useState } from 'react'
import { LOCALES, LOCALE_LABELS } from '@shared/constants/locales'
import type { Locale } from '@shared/constants/locales'
import { inputClass } from './form'
import type { LocalizedText } from '../../lib/catalog'

interface LocalizedInputProps {
  label: string
  value: LocalizedText
  onChange: (value: LocalizedText) => void
  multiline?: boolean
  /** Marks Arabic as required (the default market language). */
  required?: boolean
}

/** Localized text field with one tab per locale; Arabic renders RTL. */
export function LocalizedInput({
  label,
  value,
  onChange,
  multiline = false,
  required = false,
}: LocalizedInputProps) {
  const [active, setActive] = useState<Locale>('ar')

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">
          {label}
          {required && <span className="text-gold"> *</span>}
        </span>

        <div className="flex gap-1">
          {LOCALES.map((locale) => (
            <button
              key={locale}
              type="button"
              title={LOCALE_LABELS[locale]}
              onClick={() => setActive(locale)}
              className={`rounded-brand px-2 py-1 font-sans text-[11px] uppercase tracking-[0.15em] transition-colors ${
                active === locale ? 'bg-gold text-cream-card' : 'text-ink/60 hover:text-gold'
              }`}
            >
              {locale}
              {value[locale] && active !== locale ? <span className="text-gold"> *</span> : null}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2">
        {multiline ? (
          <textarea
            rows={3}
            dir={active === 'ar' ? 'rtl' : 'ltr'}
            value={value[active]}
            onChange={(event) => onChange({ ...value, [active]: event.target.value })}
            className={inputClass}
          />
        ) : (
          <input
            type="text"
            dir={active === 'ar' ? 'rtl' : 'ltr'}
            value={value[active]}
            onChange={(event) => onChange({ ...value, [active]: event.target.value })}
            className={inputClass}
          />
        )}
      </div>
    </div>
  )
}
