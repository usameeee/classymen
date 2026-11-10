import { useState, useCallback, type ReactNode } from 'react'
import { ToastContext, type Toast, type ToastVariant } from './ToastContext'
import { ToastStack } from '../components/ui/Toast'

let _id = 0
const uid = () => `toast-${Date.now()}-${++_id}`

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback(
    (message: string, variant: ToastVariant = 'info', detail?: string, duration = 4000) => {
      const id = uid()
      setToasts((prev) => [...prev, { id, message, variant, detail, duration }])

      if (duration > 0) {
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, duration)
      }
    },
    [],
  )

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastStack toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

