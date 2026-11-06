import { Router } from 'express';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { env } from '../config/env';
import { requireAuth, requireRole } from '../middleware/auth';
import { ApiError } from '../utils/http';

const DEFAULT_FOLDER = 'classy-men/products';

export const uploadRouter = Router();

/**
 * Returns a signed payload so the admin client can upload images straight to
 * Cloudinary without exposing the API secret.
 * @see docs/IMAGE_PIPELINE.md
 */
uploadRouter.post('/signature', requireAuth, requireRole('admin'), (req, res) => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(503, 'Image pipeline is not configured.');
  }

  const folder =
    typeof req.body?.folder === 'string' && req.body.folder.trim()
      ? (req.body.folder as string).trim()
      : DEFAULT_FOLDER;
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { folder, timestamp },
    env.CLOUDINARY_API_SECRET as string,
  );

  res.json({
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    folder,
    timestamp,
    signature,
  });
});
