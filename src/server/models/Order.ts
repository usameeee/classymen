import { Schema, model, type InferSchemaType } from 'mongoose';
import { DEFAULT_CURRENCY } from '@shared/constants/catalog';
import { DEFAULT_LOCALE, LOCALES } from '@shared/constants/locales';
import { DEFAULT_ORDER_STATUS, ORDER_STATUSES } from '@shared/constants/orderStatus';
import { generateOrderNumber } from '../utils/ids';

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    /** Snapshot of the product name so history survives catalog edits. */
    name: { type: String, required: true, trim: true },
    size: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: true },
);

/** Customer details collected during WhatsApp checkout. */
const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    customer: { type: customerSchema, required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, default: 0, min: 0 },
    coupon: {
      code: { type: String, uppercase: true, trim: true },
      discountAmount: { type: Number, min: 0 },
    },
    total: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, default: DEFAULT_CURRENCY },
    status: {
      type: String,
      enum: [...ORDER_STATUSES],
      default: DEFAULT_ORDER_STATUS,
      required: true,
    },
    whatsappConfirmed: { type: Boolean, default: false },
    locale: { type: String, enum: [...LOCALES], default: DEFAULT_LOCALE },
  },
  { timestamps: true },
);

orderSchema.pre('validate', function () {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
});

export type Order = InferSchemaType<typeof orderSchema>;

export const OrderModel = model('Order', orderSchema);
