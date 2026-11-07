import { z } from 'zod';
import { LOCALES } from '../constants/locales';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6).max(100),
  phone: z.string().trim().max(30).optional().or(z.literal('')).transform((v) => v || undefined),
  locale: z.enum(LOCALES).optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().trim().length(6),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  locale: z.enum(LOCALES).optional(),
});

export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  locale: z.enum(LOCALES).optional(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().trim().length(6),
  newPassword: z.string().min(6).max(100),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
