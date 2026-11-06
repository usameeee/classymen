import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { ApiError } from '../utils/http';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found.' });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : String(err);
  console.error('[error]', message);
  res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Internal server error.' : message,
  });
}
