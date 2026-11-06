import mongoose from 'mongoose';
import { env } from './env';

/**
 * Connects to MongoDB. If no URI is configured (local development without a
 * database) it logs a warning and lets the API keep running.
 */
export async function connectDB(): Promise<typeof mongoose | null> {
  if (!env.MONGODB_URI) {
    console.warn('[db] MONGODB_URI not set — skipping database connection.');
    return null;
  }

  mongoose.connection.on('connected', () => console.log('[db] MongoDB connected.'));
  mongoose.connection.on('error', (err) => console.error('[db] MongoDB error:', err));
  mongoose.connection.on('disconnected', () => console.warn('[db] MongoDB disconnected.'));

  await mongoose.connect(env.MONGODB_URI);
  return mongoose;
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
