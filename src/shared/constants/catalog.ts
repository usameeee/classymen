/**
 * Catalog constants shared between the API and the storefront.
 * @see docs/PROJECT_BRIEF.md
 */

/** Standard ready-made Daraa sizes (Mauritanian men's robe). */
export const DARAA_SIZES = ['6', '8', '10'] as const;

export type DaraaSize = (typeof DARAA_SIZES)[number];

export interface SizeCategoryPreset {
  id: string;
  name: { ar: string; fr: string; en: string };
  sizes: string[];
}

export const DEFAULT_SIZE_CATEGORIES: SizeCategoryPreset[] = [
  {
    id: 'daraa',
    name: { ar: 'الذراعة (Daraa)', fr: 'Daraa', en: 'Daraa' },
    sizes: ['6', '8', '10'],
  },
  {
    id: 'clothing',
    name: { ar: 'الملابس', fr: 'Vêtements', en: 'Clothing' },
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  {
    id: 'shoes',
    name: { ar: 'الأحذية', fr: 'Chaussures', en: 'Footwear' },
    sizes: ['39', '40', '41', '42', '43', '44', '45', '46'],
  },
  {
    id: 'fragrance',
    name: { ar: 'العطور', fr: 'Parfumerie', en: 'Fragrance' },
    sizes: ['30ml', '50ml', '75ml', '100ml', '200ml'],
  },
  {
    id: 'standard',
    name: { ar: 'مقاس موحد', fr: 'Taille unique', en: 'One Size' },
    sizes: ['Standard', 'Unique'],
  },
];

/** Standard category size preset groups */
export const SIZE_PRESETS = {
  daraa: {
    label: 'Daraa (الذراعة)',
    sizes: ['6', '8', '10'],
  },
  clothing: {
    label: 'Clothing (الملابس)',
    sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
  },
  shoes: {
    label: 'Footwear (الأحذية)',
    sizes: ['39', '40', '41', '42', '43', '44', '45', '46'],
  },
  fragrance: {
    label: 'Fragrance (العطور)',
    sizes: ['30ml', '50ml', '75ml', '100ml', '200ml'],
  },
  standard: {
    label: 'One Size / Standard',
    sizes: ['Standard', 'Unique'],
  },
} as const;

export const ALL_DEFAULT_SIZES: readonly string[] = Array.from(
  new Set<string>([
    ...SIZE_PRESETS.daraa.sizes,
    ...SIZE_PRESETS.clothing.sizes,
    ...SIZE_PRESETS.shoes.sizes,
    ...SIZE_PRESETS.fragrance.sizes,
    ...SIZE_PRESETS.standard.sizes,
  ])
);

/** How an uploaded image is used in the storefront scenes. */
export const PRODUCT_IMAGE_ROLES = [
  'product',
  'model-photo',
  'mannequin-photo',
  'detail',
  'gallery',
] as const;

export type ProductImageRole = (typeof PRODUCT_IMAGE_ROLES)[number];

export const PRODUCT_IMAGE_ROLE_LABELS: Record<ProductImageRole, string> = {
  product: 'Product',
  'model-photo': 'Model photo',
  'mannequin-photo': 'Mannequin photo',
  detail: 'Detail',
  gallery: 'Gallery',
};

export const DEFAULT_PRODUCT_IMAGE_ROLE: ProductImageRole = 'product';

/** Image pipeline status states. @see docs/IMAGE_PIPELINE.md */
export const IMAGE_STATUSES = ['queued', 'processing', 'ready', 'needs_review', 'failed'] as const;

export type ImageStatus = (typeof IMAGE_STATUSES)[number];

/** ISO 4217 code for the Mauritanian Ouguiya. */
export const DEFAULT_CURRENCY = 'MRU';
