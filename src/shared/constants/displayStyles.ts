import type { Locale } from './locales';

/**
 * Interactive display styles for storefront scenes and category highlights.
 * Add new styles in `src/client/scenes/` or `showcase/` and register them here.
 * @see docs/DISPLAY_SYSTEM.md
 */
export const DISPLAY_STYLES = [
  'stage-3d',
  'mannequin',
  'rail',
  'cabinet',
  'shelf',
  'floating',
  'wardrobe',
  'grid-clean',
] as const;

export type DisplayStyle = (typeof DISPLAY_STYLES)[number];

/** Default style used when a category does not specify one. */
export const DEFAULT_DISPLAY_STYLE: DisplayStyle = 'rail';

/** Safe fallback for weak devices or catalog pages. */
export const FALLBACK_DISPLAY_STYLE: DisplayStyle = 'grid-clean';

export interface LocalizedDisplayStyleLabel {
  ar: string;
  fr: string;
  en: string;
}

/** Trilingual labels for admin selectors and storefront display style selection */
export const DISPLAY_STYLE_I18N: Record<DisplayStyle, LocalizedDisplayStyleLabel> = {
  'stage-3d': {
    ar: 'منصة ثلاثية الأبعاد تفاعلية (Stage 3D & Halo)',
    fr: 'Scène 3D Interactive (Halo, 3D Tilt & Miroir)',
    en: 'Interactive 3D Stage (Halo, 3D Tilt & Floor Reflection)',
  },
  mannequin: {
    ar: 'مانيكان تفاعلي ثلاثي الأبعاد (Mannequin)',
    fr: 'Mannequin Interactif 3D',
    en: 'Interactive 3D Mannequin',
  },
  rail: {
    ar: 'علاقة ملابس متحركة (Rail)',
    fr: 'Penderie Rails Dynamique',
    en: 'Sliding Clothes Rail',
  },
  cabinet: {
    ar: 'خزانة عرض زجاجية دافئة (Cabinet)',
    fr: 'Vitrine en Verre d’Atelier',
    en: 'Warm Glass Boutique Cabinet',
  },
  shelf: {
    ar: 'رف عرض مفتوح مع ظلال (Shelf)',
    fr: 'Étagère d’Exposition Prestige',
    en: 'Luxury Showcase Shelf',
  },
  floating: {
    ar: 'بطاقات عائمة خفيفة (Floating)',
    fr: 'Cartes en Lévitation Zéro-Gravité',
    en: 'Zero-Gravity Floating Cards',
  },
  wardrobe: {
    ar: 'دولاب ملابس كامل بأبواب 3D (Wardrobe)',
    fr: 'Garde-robe 3D Double Porte',
    en: '3D Dual-Door Wardrobe Closet',
  },
  'grid-clean': {
    ar: 'شبكة كلاسيكية أنيقة (Grid)',
    fr: 'Grille Épurée & Minimaliste',
    en: 'Clean Minimalist Grid',
  },
};

/**
 * Helper to pick localized display style label with graceful fallback.
 */
export function getDisplayStyleLabel(style: DisplayStyle, locale: Locale = 'en'): string {
  const entry = DISPLAY_STYLE_I18N[style];
  if (!entry) return style;
  return entry[locale] || entry.en || style;
}

/** Legacy English-only map for backward compatibility */
export const DISPLAY_STYLE_LABELS: Record<DisplayStyle, string> = {
  'stage-3d': DISPLAY_STYLE_I18N['stage-3d'].en,
  mannequin: DISPLAY_STYLE_I18N.mannequin.en,
  rail: DISPLAY_STYLE_I18N.rail.en,
  cabinet: DISPLAY_STYLE_I18N.cabinet.en,
  shelf: DISPLAY_STYLE_I18N.shelf.en,
  floating: DISPLAY_STYLE_I18N.floating.en,
  wardrobe: DISPLAY_STYLE_I18N.wardrobe.en,
  'grid-clean': DISPLAY_STYLE_I18N['grid-clean'].en,
};
