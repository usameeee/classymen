import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DEFAULT_CURRENCY } from '@shared/constants/catalog'
import { deleteProduct, fetchCategories, fetchProducts } from '../../lib/catalog'
import type { Category, Product } from '../../lib/catalog'

function formatPrice(product: Product) {
  return `${product.price.toLocaleString()} ${product.currency ?? DEFAULT_CURRENCY}`
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryFilter, setCategoryFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setProducts((await fetchProducts({ category: categoryFilter || undefined })).items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products.')
    } finally {
      setLoading(false)
    }
  }, [categoryFilter])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete the product "${product.name.ar}"?`)) {
      return
    }
    setError(null)
    try {
      await deleteProduct(product._id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Products</h1>
          <p className="mt-1 font-sans text-sm text-ink/70">
            Catalog items, their pricing and storefront availability.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="rounded-brand bg-gold px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark"
        >
          New product
        </Link>
      </div>

      <div className="mt-6 max-w-xs">
        <label className="block">
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="mt-2 w-full rounded-brand border border-line bg-cream px-3 py-2 font-sans text-sm text-ink outline-none transition-colors focus:border-gold"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name.ar}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-brand border border-gold px-4 py-3 font-sans text-sm text-gold-dark">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-brand border border-line bg-cream-card">
        <table className="w-full min-w-[44rem] text-left">
          <thead>
            <tr className="border-b border-line font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
              <th className="px-4 py-3 font-normal">Name (ar)</th>
              <th className="px-4 py-3 font-normal">Category</th>
              <th className="px-4 py-3 font-normal">Price</th>
              <th className="px-4 py-3 font-normal">Status</th>
              <th className="px-4 py-3 font-normal">Featured</th>
              <th className="px-4 py-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 font-sans text-sm text-ink/60">
                  Loading
                </td>
              </tr>
            )}

            {!loading && products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 font-sans text-sm text-ink/60">
                  No products yet.
                </td>
              </tr>
            )}

            {products.map((product) => (
              <tr key={product._id} className="border-b border-line/60 last:border-b-0">
                <td className="px-4 py-3 font-sans text-sm text-ink">
                  <span dir="rtl">{product.name.ar}</span>
                  {product.name.en && (
                    <span className="mt-0.5 block text-xs text-ink/50">{product.name.en}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-sans text-sm text-ink/70">
                  <span dir="rtl">{product.category?.name.ar}</span>
                </td>
                <td className="px-4 py-3 font-sans text-sm text-ink/70">{formatPrice(product)}</td>
                <td className="px-4 py-3 font-sans text-sm">
                  <span className={product.isActive ? 'text-gold' : 'text-ink/50'}>
                    {product.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3 font-sans text-sm text-ink/70">
                  {product.isFeatured ? 'Yes' : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="font-sans text-xs uppercase tracking-[0.15em] text-ink/70 transition-colors hover:text-gold"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="font-sans text-xs uppercase tracking-[0.15em] text-ink/70 transition-colors hover:text-gold"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
