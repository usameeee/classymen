import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@shared/constants/roles';
import { env } from '../config/env';
import { UserModel } from '../models/User';
import { ApiError } from '../utils/http';

const SALT_ROUNDS = 10;

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
  });

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  };
}

/** Validates credentials and returns the user, or throws a 401. */
export async function authenticate(email: string, password: string): Promise<AuthenticatedUser> {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid credentials.');
  }

  const matches = await verifyPassword(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, 'Invalid credentials.');
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
