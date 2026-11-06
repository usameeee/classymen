/**
 * Interactive display styles for storefront scenes.
 * Add new styles in `src/client/scenes/` and register them here.
 * @see docs/DISPLAY_SYSTEM.md
 */
export const DISPLAY_STYLES = [
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

export const DISPLAY_STYLE_LABELS: Record<DisplayStyle, string> = {
  mannequin: 'Mannequin',
  rail: 'Rail',
  cabinet: 'Cabinet',
  shelf: 'Shelf',
  floating: 'Floating',
  wardrobe: 'Wardrobe',
  'grid-clean': 'Grid (clean)',
};
