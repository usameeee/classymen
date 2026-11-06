import { Schema, model, type InferSchemaType } from 'mongoose';
import { DEFAULT_USER_ROLE, USER_ROLES } from '@shared/constants/roles';

/**
 * Admin user. Passwords are stored as bcrypt hashes and never selected by
 * default; use `.select('+passwordHash')` when authenticating.
 */
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: [...USER_ROLES], default: DEFAULT_USER_ROLE, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

export const UserModel = model('User', userSchema);
