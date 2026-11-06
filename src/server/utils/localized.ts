import { DEFAULT_LOCALE } from '@shared/constants/locales';
import type { Locale } from '@shared/constants/locales';

/** Picks the best available locale string from a LocalizedText-like record. */
export function pickLocalized(
  value: Record<string, string> | undefined | null,
  locale: Locale = DEFAULT_LOCALE,
): string {
  if (!value) return '';
  return value[locale] ?? value[DEFAULT_LOCALE] ?? Object.values(value).find(Boolean) ?? '';
}

