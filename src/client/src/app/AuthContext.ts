import { createContext } from 'react'
import type { UserRole } from '@shared/constants/roles'

/** Authenticated user as returned by the API. */
export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface SignupData {
  name: string
  email: string
  password: string
  phone?: string
  locale?: string
}

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  /** False while a stored session is being restored. */
  ready: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  signup: (data: SignupData) => Promise<{ message: string; email: string }>
  verifyOtp: (email: string, otp: string) => Promise<void>
  resendOtp: (email: string, locale?: string) => Promise<void>
  forgotPassword: (email: string, locale?: string) => Promise<void>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
