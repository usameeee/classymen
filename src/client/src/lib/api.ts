/**
 * Thin fetch wrapper for the Classy Men Rim API.
 * Stores the JWT in localStorage and attaches it to every request.
 */

const TOKEN_KEY = 'cmr:token'
const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

/** Error carrying the HTTP status, mirroring the server's error contract. */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly email?: string

  constructor(status: number, message: string, code?: string, email?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.email = email
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface RequestOptions {
  method?: HttpMethod
  body?: unknown
  /** Send the stored token (default: true). Set false for public endpoints. */
  auth?: boolean
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }
  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const normalizedPath = path.startsWith('/api/')
    ? path
    : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`

  const response = await fetch(normalizedPath, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (response.status === 204) {
    return undefined as T
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const errorObj = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
    const message = errorObj && 'error' in errorObj ? String(errorObj.error) : `Request failed with status ${response.status}.`
    const code = errorObj && 'code' in errorObj ? String(errorObj.code) : undefined
    const email = errorObj && 'email' in errorObj ? String(errorObj.email) : undefined
    throw new ApiError(response.status, message, code, email)
  }

  return payload as T
}
