/**
 * Supported storefront locales. Arabic is the default and renders RTL.
 * @see docs/PROJECT_BRIEF.md
 */
export const LOCALES = ['ar', 'fr', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'ar';

export type Direction = 'rtl' | 'ltr';

export const LOCALE_DIRECTION: Record<Locale, Direction> = {
  ar: 'rtl',
  fr: 'ltr',
  en: 'ltr',
};

export const LOCALE_LABELS: Record<Locale, string> = {
  ar: 'العربية',
  fr: 'Français',
  en: 'English',
};
