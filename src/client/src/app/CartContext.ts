import { createContext } from 'react'
import type { LocalizedText } from '../lib/catalog'

/** A single cart line. Lines are unique per product + optional size. */
export interface CartLine {
  productId: string
  slug: string
  name: LocalizedText
  price: number
  currency: string
  image?: string
  size?: string
  quantity: number
  /** Whether this line should be gift-wrapped. */
  isGift?: boolean
  /** Optional personal message printed on the gift tag. */
  giftMessage?: string
}

export interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void
  setQuantity: (productId: string, size: string | undefined, quantity: number) => void
  setGift: (productId: string, size: string | undefined, isGift: boolean, message?: string) => void
  remove: (productId: string, size: string | undefined) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

/** Stable identity for a cart line. */
export function lineKey(productId: string, size?: string): string {
  return `${productId}::${size ?? ''}`
}
