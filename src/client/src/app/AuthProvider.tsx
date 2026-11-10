import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { apiRequest, getToken, setToken } from '../lib/api'
import { AuthContext } from './AuthContext'
import type { AuthUser, SignupData } from './AuthContext'

interface Session {
  token: string
  user: AuthUser
}

/**
 * Holds the customer and admin session: restores it from a stored token on mount,
 * and exposes login, signup, OTP verification, password reset and logout.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setTokenState] = useState<string | null>(() => getToken())
  const [ready, setReady] = useState(() => !getToken())

  useEffect(() => {
    if (!getToken()) {
      return
    }

    let cancelled = false
    apiRequest<{ user: AuthUser }>('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        if (!cancelled) {
          setToken(null)
          setTokenState(null)
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await apiRequest<Session>('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    })
    setToken(session.token)
    setTokenState(session.token)
    setUser(session.user)
    return session.user
  }, [])

  const signup = useCallback(async (data: SignupData) => {
    return apiRequest<{ message: string; email: string }>('/auth/register', {
      method: 'POST',
      body: data,
      auth: false,
    })
  }, [])

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const session = await apiRequest<Session>('/auth/verify-otp', {
      method: 'POST',
      body: { email, otp },
      auth: false,
    })
    setToken(session.token)
    setTokenState(session.token)
    setUser(session.user)
  }, [])

  const resendOtp = useCallback(async (email: string, locale?: string) => {
    await apiRequest<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: { email, locale },
      auth: false,
    })
  }, [])

  const forgotPassword = useCallback(async (email: string, locale?: string) => {
    await apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email, locale },
      auth: false,
    })
  }, [])

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    await apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { email, otp, newPassword },
      auth: false,
    })
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setTokenState(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      ready,
      login,
      signup,
      verifyOtp,
      resendOtp,
      forgotPassword,
      resetPassword,
      logout,
    }),
    [user, token, ready, login, signup, verifyOtp, resendOtp, forgotPassword, resetPassword, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
