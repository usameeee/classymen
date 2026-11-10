import { z } from 'zod';
import { DISPLAY_STYLES } from '../constants/displayStyles';
import { booleanQuery } from './common.schema';
import { productImageInputSchema } from './image.schema';
import { localizedNameSchema, localizedTextSchema } from './localized.schema';

const objectId = z
  .string()
  .trim()
  .regex(/^[0-9a-fA-F]{24}$/, 'Must be a valid id.');

export const WARDROBE_SECTIONS = ['hanging', 'folded', 'bottom'] as const;
export type WardrobeSection = (typeof WARDROBE_SECTIONS)[number];

export const productInputSchema = z.object({
  /** Auto-generated from the Arabic name when omitted. */
  slug: z.string().trim().min(1).optional(),
  name: localizedNameSchema,
  description: localizedTextSchema.optional(),
  category: objectId,
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  currency: z.string().trim().length(3).optional(),
  images: z.array(productImageInputSchema).optional(),
  sizes: z.array(z.string().trim().min(1)).optional(),
  isMadeToMeasure: z.boolean().optional(),
  stock: z.number().int().nonnegative().optional(),
  displayStyle: z.enum(DISPLAY_STYLES).optional(),
  wardrobeSection: z.enum(WARDROBE_SECTIONS).optional(),
  tags: z.array(z.string().trim().min(1)).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const productUpdateSchema = productInputSchema.partial();

export const productQuerySchema = z.object({
  /** Category id or slug. */
  category: z.string().trim().optional(),
  featured: booleanQuery.optional(),
  /** When true, queries ONLY products directly assigned to this category (excluding child categories) */
  direct: booleanQuery.optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(24),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
