import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CartContext, lineKey } from './CartContext'
import type { CartLine } from './CartContext'

const CART_KEY = 'cmr:cart'

function readCart(): CartLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartLine[]) : []
  } catch {
    return []
  }
}

/** Persists the cart in localStorage so it survives reloads. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readCart)

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(lines))
  }, [lines])

  const add = useCallback((line: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((current) => {
      const key = lineKey(line.productId, line.size)
      if (current.some((item) => lineKey(item.productId, item.size) === key)) {
        return current.map((item) =>
          lineKey(item.productId, item.size) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...current, { ...line, quantity }]
    })
  }, [])

  const setQuantity = useCallback(
    (productId: string, size: string | undefined, quantity: number) => {
      const key = lineKey(productId, size)
      setLines((current) =>
        current
          .map((item) => (lineKey(item.productId, item.size) === key ? { ...item, quantity } : item))
          .filter((item) => item.quantity > 0),
      )
    },
    [],
  )

  const remove = useCallback((productId: string, size: string | undefined) => {
    const key = lineKey(productId, size)
    setLines((current) =>
      current.filter((item) => lineKey(item.productId, item.size) !== key),
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const setGift = useCallback(
    (productId: string, size: string | undefined, isGift: boolean, message?: string) => {
      const key = lineKey(productId, size)
      setLines((current) =>
        current.map((item) =>
          lineKey(item.productId, item.size) === key
            ? { ...item, isGift, giftMessage: isGift ? (message ?? item.giftMessage) : undefined }
            : item,
        ),
      )
    },
    [],
  )

  const value = useMemo(
    () => ({
      lines,
      count: lines.reduce((total, line) => total + line.quantity, 0),
      subtotal: lines.reduce((total, line) => total + line.price * line.quantity, 0),
      add,
      setQuantity,
      setGift,
      remove,
      clear,
    }),
    [lines, add, setQuantity, setGift, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
