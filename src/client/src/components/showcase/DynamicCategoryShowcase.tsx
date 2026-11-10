import { useEffect, useMemo, useState } from 'react'
import { ShowcaseRenderer } from './ShowcaseRenderer'
import { fetchProducts } from '../../lib/catalog'
import type { Category, Product } from '../../lib/catalog'

interface GroupedStyleShowcaseProps {
  /** All categories that share the same displayStyle. */
  categories: Category[]
}

/**
 * GroupedStyleShowcase — renders ONE unified showcase for ALL categories
 * that share the same displayStyle.
 *
 * Rules:
 * - Fetches featured products from every category in the group in parallel.
 * - Deduplicates by product _id (in case a product appears in multiple categories).
 * - Renders nothing if the combined result has zero featured products.
 * - Uses the first category of the group as the "representative" (determines
 *   displayStyle and category metadata passed to ShowcaseRenderer).
 */
export function DynamicCategoryShowcase({ categories }: GroupedStyleShowcaseProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Stable key: sorted slugs joined — only re-fetch when category set changes
  const slugKey = useMemo(
    () => categories.map((c) => c.slug).sort().join(','),
    [categories],
  )

  useEffect(() => {
    if (categories.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    // Fetch featured products from every category in the group in parallel
    Promise.all(
      categories.map((cat) =>
        fetchProducts({ category: cat.slug, featured: true, direct: true, limit: 20 })
          .then((res) => res.items)
          .catch(() => [] as Product[]),
      ),
    ).then((results) => {
      if (cancelled) return

      // Flatten and deduplicate by _id
      const seen = new Set<string>()
      const merged: Product[] = []
      for (const batch of results) {
        for (const p of batch) {
          if (!seen.has(p._id)) {
            seen.add(p._id)
            merged.push(p)
          }
        }
      }
      setProducts(merged)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [slugKey])

  // Hidden if still loading or no featured products found across all categories
  if (loading || products.length === 0) return null

  // Representative category: use the first one (all share the same displayStyle)
  const representative = categories[0]

  return <ShowcaseRenderer category={representative} products={products} />
}
