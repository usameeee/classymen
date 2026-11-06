import { createContext } from 'react'
import type { UserRole } from '@shared/constants/roles'

/** Authenticated admin as returned by the API. */
export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  /** False while a stored session is being restored. */
  ready: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
