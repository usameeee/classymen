import { Router } from 'express';
import { loginSchema } from '@shared/schemas/auth.schema';
import { authenticate, createSession, getUserById } from '../services/auth.service';
import { requireAuth } from '../middleware/auth';
import { ApiError } from '../utils/http';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, 'Invalid email or password.');
  }

  const user = await authenticate(parsed.data.email, parsed.data.password);
  res.json(createSession(user));
});

/** Returns the current admin, used to restore a session on the client. */
authRouter.get('/me', requireAuth, async (req, res) => {
  const userId = req.auth?.sub;
  if (!userId) {
    throw new ApiError(401, 'Authentication required.');
  }

  res.json({ user: await getUserById(userId) });
});
