import type { Locale } from './locales';

/**
 * Interactive showcase styles for category highlights on the homepage.
 * Coders register new style components in `src/client/src/components/showcase/`
 * and administrators pick which category inherits which style from the admin panel.
 */
export const SHOWCASE_STYLES = [
  'stage-3d',
  'none',
] as const;

export type ShowcaseStyle = (typeof SHOWCASE_STYLES)[number];

export const DEFAULT_SHOWCASE_STYLE: ShowcaseStyle = 'none';

export interface LocalizedStyleLabel {
  ar: string;
  fr: string;
  en: string;
}

/** Trilingual labels for admin selectors and storefront previews */
export const SHOWCASE_STYLE_I18N: Record<ShowcaseStyle, LocalizedStyleLabel> = {
  'stage-3d': {
    ar: 'منصة ثلاثية الأبعاد (هالة ضوئية، حركة 3D، قاعدة مرآة)',
    fr: 'Scène 3D (Halo lumineux, inclinaison 3D & sol miroir)',
    en: '3D Stage (Dynamic Halo, 3D Tilt & Mirror Floor)',
  },
  none: {
    ar: 'بدون عرض خاص (شبكة عادية)',
    fr: 'Aucun (Grille standard)',
    en: 'None (Standard Grid)',
  },
};

/**
 * Helper to pick localized style label with graceful fallback.
 */
export function getShowcaseStyleLabel(style: ShowcaseStyle, locale: Locale = 'en'): string {
  const entry = SHOWCASE_STYLE_I18N[style];
  if (!entry) return style;
  return entry[locale] || entry.en || style;
}

/** Legacy English-only map for backward compatibility */
export const SHOWCASE_STYLE_LABELS: Record<ShowcaseStyle, string> = {
  'stage-3d': SHOWCASE_STYLE_I18N['stage-3d'].en,
  none: SHOWCASE_STYLE_I18N.none.en,
};
