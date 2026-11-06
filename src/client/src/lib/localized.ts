import type { Locale } from '@shared/constants/locales'
import type { LocalizedText } from './catalog'

/**
 * Resolves localized copy for the active locale, falling back to Arabic
 * (the default market language) and finally to any non-empty value.
 */
export function pickText(value: LocalizedText | undefined, locale: Locale): string {
  if (!value) {
    return ''
  }
  return value[locale] || value.ar || value.fr || value.en || ''
}
