import { Router } from 'express';
import {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@shared/schemas/auth.schema';
import {
  authenticate,
  createSession,
  getUserById,
  registerCustomer,
  verifyEmailOtp,
  resendVerificationOtp,
  forgotPassword,
  resetPasswordWithOtp,
} from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import { ApiError } from '../utils/http';

export const authRouter = Router();

/** POST /api/auth/register — Public customer signup */
authRouter.post('/register', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid signup details. Check your name, email and password.');
  }

  const result = await registerCustomer(parsed.data);
  res.status(201).json(result);
});

/** POST /api/auth/verify-otp — Verifies 6-digit email OTP */
authRouter.post('/verify-otp', async (req, res) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid verification code format (6 digits required).');
  }

  const session = await verifyEmailOtp(parsed.data.email, parsed.data.otp);
  res.json(session);
});

/** POST /api/auth/resend-otp — Resends verification code */
authRouter.post('/resend-otp', async (req, res) => {
  const parsed = resendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'Valid email is required.');
  }

  const result = await resendVerificationOtp(parsed.data.email, parsed.data.locale);
  res.json(result);
});

/** POST /api/auth/forgot-password — Request password reset OTP */
authRouter.post('/forgot-password', async (req, res) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'Valid email is required.');
  }

  const result = await forgotPassword(parsed.data.email, parsed.data.locale);
  res.json(result);
});

/** POST /api/auth/reset-password — Reset password with OTP */
authRouter.post('/reset-password', async (req, res) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid details. 6-digit code and min 6 characters password required.');
  }

  const result = await resetPasswordWithOtp(parsed.data.email, parsed.data.otp, parsed.data.newPassword);
  res.json(result);
});

/** POST /api/auth/login — Customer & admin login */
authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid email or password.');
  }

  try {
    const user = await authenticate(parsed.data.email, parsed.data.password);
    res.json(createSession(user));
  } catch (err: unknown) {
    const custom = err as { status?: number; message?: string; code?: string; email?: string };
    if (custom.code === 'UNVERIFIED_EMAIL') {
      res.status(403).json({
        error: custom.message,
        code: 'UNVERIFIED_EMAIL',
        email: custom.email,
      });
      return;
    }
    throw err;
  }
});

/** GET /api/auth/me — Returns the current user */
authRouter.get('/me', requireAuth, async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) {
    throw new ApiError(401, 'Authentication required.');
  }

  res.json({ user: await getUserById(userId) });
});
