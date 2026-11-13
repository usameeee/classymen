import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteCategory, fetchCategories } from '../../lib/catalog'
import type { Category } from '../../lib/catalog'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCategories(await fetchCategories())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function handleDelete(category: Category) {
    if (!window.confirm(`Delete the category "${category.name.ar}"?`)) {
      return
    }
    setError(null)
    try {
      await deleteCategory(category._id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category.')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">Categories</h1>
          <p className="mt-1 font-sans text-sm text-ink/70">
            Storefront product categories and collection taxonomy.
          </p>
        </div>
        <Link
          to="/admin/categories/new"
          className="rounded-brand bg-gold px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark"
        >
          New category
        </Link>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-brand border border-gold px-4 py-3 font-sans text-sm text-gold-dark">
          {error}
        </p>
      )}

      <div className="mt-8 overflow-x-auto rounded-brand border border-line bg-cream-card">
        <table className="w-full min-w-[40rem] text-left">
          <thead>
            <tr className="border-b border-line font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
              <th className="px-4 py-3 font-normal">Name (ar)</th>
              <th className="px-4 py-3 font-normal">Parent</th>
              <th className="px-4 py-3 font-normal">Slug</th>
              <th className="px-4 py-3 font-normal">Order</th>
              <th className="px-4 py-3 font-normal">Status</th>
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

            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 font-sans text-sm text-ink/60">
                  No categories yet.
                </td>
              </tr>
            )}

            {categories.map((category) => (
              <tr key={category._id} className="border-b border-line/60 last:border-b-0">
                <td className="px-4 py-3 font-sans text-sm text-ink">
                  <div className="flex items-center gap-1.5">
                    {category.parent && <span className="text-gold font-bold">↳</span>}
                    <span dir="rtl">{category.name.ar}</span>
                  </div>
                  {category.name.en && (
                    <span className="mt-0.5 block text-xs text-ink/50">{category.name.en}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-sans text-sm text-ink/70">
                  {category.parent ? (
                    <span className="inline-block rounded bg-line/40 px-2 py-0.5 text-xs text-ink/80">
                      {category.parent.name.ar}
                    </span>
                  ) : (
                    <span className="text-xs text-ink/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 font-sans text-sm text-ink/70">{category.slug}</td>
                <td className="px-4 py-3 font-sans text-sm text-ink/70">{category.order}</td>
                <td className="px-4 py-3 font-sans text-sm">
                  <span className={category.isActive ? 'text-gold' : 'text-ink/50'}>
                    {category.isActive ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link
                      to={`/admin/categories/${category._id}/edit`}
                      className="font-sans text-xs uppercase tracking-[0.15em] text-ink/70 transition-colors hover:text-gold"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(category)}
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
