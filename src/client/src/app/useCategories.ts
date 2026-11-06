import { useEffect, useState } from 'react'
import { fetchCategories } from '../lib/catalog'
import type { Category } from '../lib/catalog'

/** Loads the active storefront categories (public, hidden ones excluded). */
export function useCategories(): Category[] {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let cancelled = false
    fetchCategories(false)
      .then((list) => {
        if (!cancelled) setCategories(list)
      })
      .catch(() => {
        if (!cancelled) setCategories([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return categories
}
