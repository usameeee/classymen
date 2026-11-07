import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomInt } from 'crypto';
import type { UserRole } from '@shared/constants/roles';
import type { Locale } from '@shared/constants/locales';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { ApiError } from '../utils/http';
import { sendOtpEmail } from './email.service';

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

function generateOtp(): string {
  return randomInt(100000, 999999).toString();
}

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
}

/** User shape safe to send to the client. */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

function getJwtSecret(): string {
  if (!env.JWT_SECRET) {
    throw new ApiError(500, 'JWT_SECRET is not configured.');
  }
  return env.JWT_SECRET;
}

export function signToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getJwtSecret(), options);
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, getJwtSecret()) as unknown as AuthTokenPayload;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export async function createUser(input: CreateUserInput): Promise<AuthenticatedUser> {
  const email = input.email.toLowerCase();
  const existing = await UserModel.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await UserModel.create({
    name: input.name,
    email,
    passwordHash,
    role: input.role,
    isVerified: true, // Internal/admin created users are pre-verified
  });

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };
}

export interface RegisterCustomerInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  locale?: Locale;
}

/** Registers a new customer and sends a 6-digit OTP verification email. */
export async function registerCustomer(input: RegisterCustomerInput): Promise<{ message: string; email: string }> {
  const email = input.email.toLowerCase();
  const existing = await UserModel.findOne({ email });

  const otp = generateOtp();
  const otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  const passwordHash = await hashPassword(input.password);

  if (existing) {
    if (existing.isVerified) {
      throw new ApiError(409, 'An account with this email already exists. Please log in.');
    }
    // Existing unverified account: update credentials and refresh OTP
    existing.name = input.name;
    existing.phone = input.phone;
    existing.passwordHash = passwordHash;
    existing.verificationOtp = otp;
    existing.verificationOtpExpires = otpExpires;
    await existing.save();

    void sendOtpEmail({
      to: email,
      name: input.name,
      code: otp,
      type: 'verify',
      locale: input.locale,
    });

    return { message: 'Verification code sent to your email.', email };
  }

  await UserModel.create({
    name: input.name,
    email,
    phone: input.phone,
    passwordHash,
    role: 'customer',
    isVerified: false,
    verificationOtp: otp,
    verificationOtpExpires: otpExpires,
  });

  void sendOtpEmail({
    to: email,
    name: input.name,
    code: otp,
    type: 'verify',
    locale: input.locale,
  });

  return { message: 'Verification code sent to your email.', email };
}

/** Verifies customer email with 6-digit OTP and returns an authenticated session. */
export async function verifyEmailOtp(email: string, otp: string): Promise<{ token: string; user: AuthenticatedUser }> {
  const cleanEmail = email.toLowerCase();
  const user = await UserModel.findOne({ email: cleanEmail }).select('+verificationOtp +verificationOtpExpires');
  if (!user) {
    throw new ApiError(404, 'Account not found.');
  }

  if (user.isVerified) {
    // Already verified: return session
    return createSession({
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
    });
  }

  if (!user.verificationOtp || !user.verificationOtpExpires) {
    throw new ApiError(400, 'No verification code was requested.');
  }

  if (user.verificationOtpExpires < new Date()) {
    throw new ApiError(400, 'Verification code has expired. Please request a new one.');
  }

  if (user.verificationOtp.trim() !== otp.trim()) {
    throw new ApiError(400, 'Invalid verification code.');
  }

  user.isVerified = true;
  user.verificationOtp = undefined;
  user.verificationOtpExpires = undefined;
  await user.save();

  return createSession({
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  });
}

/** Resends a new 6-digit verification OTP. */
export async function resendVerificationOtp(email: string, locale?: Locale): Promise<{ message: string }> {
  const cleanEmail = email.toLowerCase();
  const user = await UserModel.findOne({ email: cleanEmail });
  if (!user) {
    throw new ApiError(404, 'Account not found.');
  }

  if (user.isVerified) {
    throw new ApiError(400, 'Account is already verified. Please sign in.');
  }

  const otp = generateOtp();
  user.verificationOtp = otp;
  user.verificationOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  void sendOtpEmail({
    to: cleanEmail,
    name: user.name,
    code: otp,
    type: 'verify',
    locale,
  });

  return { message: 'A new verification code has been sent.' };
}

/** Initiates a forgot password request by generating and emailing an OTP. */
export async function forgotPassword(email: string, locale?: Locale): Promise<{ message: string }> {
  const cleanEmail = email.toLowerCase();
  const user = await UserModel.findOne({ email: cleanEmail });
  if (!user || !user.isActive) {
    // Don't leak user existence, always return success message
    return { message: 'If an account exists with this email, a reset code has been sent.' };
  }

  const otp = generateOtp();
  user.resetOtp = otp;
  user.resetOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();

  void sendOtpEmail({
    to: cleanEmail,
    name: user.name,
    code: otp,
    type: 'reset',
    locale,
  });

  return { message: 'If an account exists with this email, a reset code has been sent.' };
}

/** Resets a user password using the 6-digit OTP code. */
export async function resetPasswordWithOtp(email: string, otp: string, newPass: string): Promise<{ message: string }> {
  const cleanEmail = email.toLowerCase();
  const user = await UserModel.findOne({ email: cleanEmail }).select('+resetOtp +resetOtpExpires');
  if (!user || !user.isActive) {
    throw new ApiError(400, 'Invalid request or expired code.');
  }

  if (!user.resetOtp || !user.resetOtpExpires) {
    throw new ApiError(400, 'No password reset code requested.');
  }

  if (user.resetOtpExpires < new Date()) {
    throw new ApiError(400, 'Password reset code has expired.');
  }

  if (user.resetOtp.trim() !== otp.trim()) {
    throw new ApiError(400, 'Invalid reset code.');
  }

  user.passwordHash = await hashPassword(newPass);
  user.resetOtp = undefined;
  user.resetOtpExpires = undefined;
  // If account wasn't verified, successful password reset via email verifies it
  user.isVerified = true;
  await user.save();

  return { message: 'Password has been reset successfully. You can now log in.' };
}

/** Validates credentials and returns the user, or throws a 401/403. */
export async function authenticate(email: string, password: string): Promise<AuthenticatedUser> {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const matches = await verifyPassword(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  if (user.role === 'customer' && !user.isVerified) {
    throw Object.assign(new ApiError(403, 'Email not verified. Please verify your account.'), {
      code: 'UNVERIFIED_EMAIL',
      email: user.email,
    });
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };
}

export async function getUserById(id: string): Promise<AuthenticatedUser> {
  const user = await UserModel.findById(id);
  if (!user || !user.isActive) {
    throw new ApiError(404, 'User not found.');
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };
}

/** Signs a token for an authenticated user. */
export function createSession(user: AuthenticatedUser): { token: string; user: AuthenticatedUser } {
  const token = signToken({ sub: user.id, role: user.role });
  return { token, user };
}
