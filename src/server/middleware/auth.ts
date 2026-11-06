import type { NextFunction, Request, Response } from 'express';
import { hasRoleAtLeast, type UserRole } from '@shared/constants/roles';
import { verifyToken, type AuthTokenPayload } from '../services/auth.service';
import { ApiError } from '../utils/http';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

const BEARER_PREFIX = 'Bearer ';

function readToken(header: string | undefined): string | null {
  if (!header?.startsWith(BEARER_PREFIX)) {
    return null;
  }
  return header.slice(BEARER_PREFIX.length).trim();
}

/** True when the request carries an admin (or higher) token. */
export function hasAdminRole(auth: AuthTokenPayload | undefined): boolean {
  return Boolean(auth && hasRoleAtLeast(auth.role, 'admin'));
}

/** Rejects the request unless it carries a valid `Authorization: Bearer <token>` header. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readToken(req.headers.authorization);
  if (!token) {
    throw new ApiError(401, 'Authentication required.');
  }

  try {
    req.auth = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired token.');
  }

  next();
}

/** Populates `req.auth` when a valid token is present, but never rejects. */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = readToken(req.headers.authorization);
  if (token) {
    try {
      req.auth = verifyToken(token);
    } catch {
      // Ignore invalid tokens: the route falls back to public behaviour.
    }
  }

  next();
}

/** Guards a route behind a minimum role (see `hasRoleAtLeast`). */
export function requireRole(minimum: UserRole) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      throw new ApiError(401, 'Authentication required.');
    }
    if (!hasRoleAtLeast(req.auth.role, minimum)) {
      throw new ApiError(403, 'Insufficient permissions.');
    }
    next();
  };
}
