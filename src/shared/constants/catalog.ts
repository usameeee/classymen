/**
 * Catalog constants shared between the API and the storefront.
 * @see docs/PROJECT_BRIEF.md
 */

/** Standard ready-made Daraa sizes (Mauritanian men's robe). */
export const DARAA_SIZES = ['6', '8', '10'] as const;

export type DaraaSize = (typeof DARAA_SIZES)[number];

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
