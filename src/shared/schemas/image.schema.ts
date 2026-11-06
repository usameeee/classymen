import { z } from 'zod';
import { IMAGE_STATUSES, PRODUCT_IMAGE_ROLES } from '../constants/catalog';

/** Image already uploaded to Cloudinary. */
export const imageInputSchema = z.object({
  url: z.string().trim().url(),
  publicId: z.string().trim().optional(),
  alt: z.string().trim().optional(),
});

/** Product image carrying its pipeline role and processing status. */
export const productImageInputSchema = imageInputSchema.extend({
  role: z.enum(PRODUCT_IMAGE_ROLES).optional(),
  status: z.enum(IMAGE_STATUSES).optional(),
});

export type ImageInput = z.infer<typeof imageInputSchema>;
export type ProductImageInput = z.infer<typeof productImageInputSchema>;
