import { z } from 'zod';
import { DISPLAY_STYLES } from '../constants/displayStyles';
import { SHOWCASE_STYLES } from '../constants/showcaseStyles';
import { imageInputSchema } from './image.schema';
import { localizedNameSchema, localizedTextSchema } from './localized.schema';

export const categoryInputSchema = z.object({
  /** Auto-generated from the Arabic name when omitted. */
  slug: z.string().trim().min(1).optional(),
  name: localizedNameSchema,
  description: localizedTextSchema.optional(),
  displayStyle: z.enum(DISPLAY_STYLES).optional(),
  showcaseOnHome: z.boolean().optional(),
  showcaseStyle: z.enum(SHOWCASE_STYLES).optional(),
  parentId: z.string().trim().nullable().optional(),
  image: imageInputSchema.optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryInputSchema.partial();

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
