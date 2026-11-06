import { Schema, model, type InferSchemaType } from 'mongoose';
import { DEFAULT_CURRENCY } from '@shared/constants/catalog';
import { DISPLAY_STYLES } from '@shared/constants/displayStyles';
import { emptyLocalizedString, localizedStringSchema } from './localized';
import { productImageSchema } from './image';

/** A sellable item. `displayStyle` optionally overrides its category scene. */
const productSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, default: () => emptyLocalizedString() },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    currency: { type: String, default: DEFAULT_CURRENCY },
    images: { type: [productImageSchema], default: [] },
    /** Ready-made sizes, e.g. Daraa 6 / 8 / 10. Empty when made-to-measure only. */
    sizes: { type: [String], default: [] },
    isMadeToMeasure: { type: Boolean, default: false },
    stock: { type: Number, default: 0, min: 0 },
    displayStyle: { type: String, enum: [...DISPLAY_STYLES] },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

productSchema.index({ 'name.ar': 'text', 'name.fr': 'text', 'name.en': 'text' });

export type Product = InferSchemaType<typeof productSchema>;

export const ProductModel = model('Product', productSchema);
