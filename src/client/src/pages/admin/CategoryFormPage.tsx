import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../../app/useApp'
import {
  DEFAULT_DISPLAY_STYLE,
  DISPLAY_STYLES,
  getDisplayStyleLabel,
} from '@shared/constants/displayStyles'
import type { DisplayStyle } from '@shared/constants/displayStyles'
import { Checkbox, Field, NumberInput, Select, inputClass } from '../../components/admin/form'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { createCategory, fetchCategories, fetchCategory, updateCategory } from '../../lib/catalog'
import type { Category, CategoryPayload, LocalizedText, ProductImageAsset } from '../../lib/catalog'

const emptyText = (): LocalizedText => ({ ar: '', fr: '', en: '' })

export function CategoryFormPage() {
  const { locale } = useApp()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [name, setName] = useState<LocalizedText>(emptyText)
  const [description, setDescription] = useState<LocalizedText>(emptyText)
  const [slug, setSlug] = useState('')
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>(DEFAULT_DISPLAY_STYLE)
  const [parentId, setParentId] = useState<string>('')
  const [availableParents, setAvailableParents] = useState<Category[]>([])
  const [order, setOrder] = useState<number | undefined>(0)
  const [isActive, setIsActive] = useState(true)
  const [images, setImages] = useState<ProductImageAsset[]>([])

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetchCategories()
      .then((cats) => {
        if (!cancelled) setAvailableParents(cats.filter((c) => c._id !== id))
      })
      .catch(() => {
        // Parent list is non-fatal; falls back to empty
      })

    if (!id) {
      return () => {
        cancelled = true
      }
    }

    fetchCategory(id)
      .then((category) => {
        if (cancelled) return
        setName(category.name)
        setDescription(category.description)
        setSlug(category.slug)
        setDisplayStyle(category.displayStyle)
        setParentId(category.parent?._id ?? '')
        setOrder(category.order)
        setIsActive(category.isActive)
        setImages(category.image ? [category.image] : [])
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load category.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!name.ar.trim()) {
      setError('The Arabic name is required.')
      return
    }

    const payload: CategoryPayload = {
      name,
      description,
      displayStyle,
      parentId: parentId || null,
      order,
      isActive,
    }
    if (slug.trim()) {
      payload.slug = slug.trim()
    }
    if (images[0]) {
      payload.image = images[0]
    }

    setSaving(true)
    try {
      if (id) {
        await updateCategory(id, payload)
      } else {
        await createCategory(payload)
      }
      navigate('/admin/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category.')
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="font-sans text-sm text-ink/60">Loading</p>
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin/categories"
        className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
      >
        Back to categories
      </Link>

      <h1 className="mt-4 font-display text-3xl text-ink">
        {isEdit ? 'Edit category' : 'New category'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <LocalizedInput label="Name" value={name} onChange={setName} required />
        <LocalizedInput label="Description" value={description} onChange={setDescription} multiline />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Slug" hint="Generated from the Arabic name when left empty.">
            <input
              type="text"
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Display style">
            <Select
              value={displayStyle}
              onChange={(value) => setDisplayStyle(value as DisplayStyle)}
              options={DISPLAY_STYLES.map((style) => ({
                value: style,
                label: getDisplayStyleLabel(style, locale),
              }))}
            />
          </Field>

          <Field label="Parent category" hint="Leave empty for a top-level category.">
            <Select
              value={parentId}
              onChange={setParentId}
              options={[
                { value: '', label: 'None (Top-level category)' },
                ...availableParents.map((cat) => ({
                  value: cat._id,
                  label: `${cat.name.ar} (${cat.name.fr || cat.name.en || cat.slug})`,
                })),
              ]}
            />
          </Field>

          <Field label="Order">
            <NumberInput value={order} onChange={setOrder} min={0} />
          </Field>
        </div>

        <div className="max-w-xs">
          <ImageUploader
            label="Image"
            value={images}
            onChange={setImages}
            folder="classy-men/categories"
          />
        </div>

        <Checkbox checked={isActive} onChange={setIsActive} label="Active on the storefront" />

        {error && (
          <p role="alert" className="rounded-brand border border-gold px-4 py-3 font-sans text-sm text-gold-dark">
            {error}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded-brand bg-gold px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card transition-colors hover:bg-gold-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving' : 'Save'}
          </button>
          <Link
            to="/admin/categories"
            className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
