import { Schema } from 'mongoose';
import {
  DEFAULT_PRODUCT_IMAGE_ROLE,
  IMAGE_STATUSES,
  PRODUCT_IMAGE_ROLES,
} from '@shared/constants/catalog';

/** Minimal image reference used by lightweight documents such as Category. */
export const imageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, default: '', trim: true },
  },
  { _id: false },
);

/** Product image carrying its pipeline role and processing status. */
export const productImageSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, trim: true },
    alt: { type: String, default: '', trim: true },
    role: { type: String, enum: [...PRODUCT_IMAGE_ROLES], default: DEFAULT_PRODUCT_IMAGE_ROLE },
    status: { type: String, enum: [...IMAGE_STATUSES], default: 'ready' },
  },
  { _id: false },
);
