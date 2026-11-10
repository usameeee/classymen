import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'luxury'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  /** Auto-dismiss after ms. Default: 4000. Set to 0 to persist. */
  duration?: number
  /** Optional sub-line detail */
  detail?: string
}

export interface ToastContextValue {
  toasts: Toast[]
  toast: (message: string, variant?: ToastVariant, detail?: string, duration?: number) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

