import { Schema, model, type InferSchemaType } from 'mongoose';
import { DEFAULT_DISPLAY_STYLE, DISPLAY_STYLES } from '@shared/constants/displayStyles';
import { DEFAULT_SHOWCASE_STYLE, SHOWCASE_STYLES } from '@shared/constants/showcaseStyles';
import { emptyLocalizedString, localizedStringSchema } from './localized';
import { imageSchema } from './image';

/** Storefront section (e.g. Daraa, Perfumes) shown with an interactive scene. */
const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, default: () => emptyLocalizedString() },
    displayStyle: {
      type: String,
      enum: [...DISPLAY_STYLES],
    },
    showcaseOnHome: {
      type: Boolean,
      default: false,
    },
    showcaseStyle: {
      type: String,
      enum: [...SHOWCASE_STYLES],
      default: DEFAULT_SHOWCASE_STYLE,
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    image: { type: imageSchema },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ parent: 1, order: 1 });

export type Category = InferSchemaType<typeof categorySchema>;

export const CategoryModel = model('Category', categorySchema);
