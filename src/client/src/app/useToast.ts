import { useContext } from 'react'
import { ToastContext, type ToastVariant } from './ToastContext'

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')

  return {
    /** Show a success toast */
    success: (message: string, detail?: string, duration?: number) =>
      ctx.toast(message, 'success', detail, duration),
    /** Show an error toast */
    error: (message: string, detail?: string, duration?: number) =>
      ctx.toast(message, 'error', detail, duration),
    /** Show a warning toast */
    warning: (message: string, detail?: string, duration?: number) =>
      ctx.toast(message, 'warning', detail, duration),
    /** Show an info toast */
    info: (message: string, detail?: string, duration?: number) =>
      ctx.toast(message, 'info', detail, duration),
    /** Show a luxury gold brand toast (promo, achievement) */
    luxury: (message: string, detail?: string, duration?: number) =>
      ctx.toast(message, 'luxury', detail, duration),
    /** Raw fire with full control */
    fire: (message: string, variant?: ToastVariant, detail?: string, duration?: number) =>
      ctx.toast(message, variant, detail, duration),
    /** Dismiss by id */
    dismiss: ctx.dismiss,
  }
}

