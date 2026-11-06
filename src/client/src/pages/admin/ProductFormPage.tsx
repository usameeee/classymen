import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DARAA_SIZES, DEFAULT_CURRENCY } from '@shared/constants/catalog'
import { DISPLAY_STYLES, DISPLAY_STYLE_LABELS } from '@shared/constants/displayStyles'
import type { DisplayStyle } from '@shared/constants/displayStyles'
import { Checkbox, Field, NumberInput, Select, inputClass } from '../../components/admin/form'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import { ImageUploader } from '../../components/admin/ImageUploader'
import {
  createProduct,
  fetchCategories,
  fetchProduct,
  updateProduct,
} from '../../lib/catalog'
import type {
  Category,
  LocalizedText,
  ProductImageAsset,
  ProductPayload,
} from '../../lib/catalog'

const emptyText = (): LocalizedText => ({ ar: '', fr: '', en: '' })

export function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState<LocalizedText>(emptyText)
  const [description, setDescription] = useState<LocalizedText>(emptyText)
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState<number | undefined>(0)
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(undefined)
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY)
  const [images, setImages] = useState<ProductImageAsset[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [isMadeToMeasure, setIsMadeToMeasure] = useState(false)
  const [stock, setStock] = useState<number | undefined>(0)
  const [displayStyle, setDisplayStyle] = useState('')
  const [tags, setTags] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!id) {
      return
    }

    let cancelled = false
    fetchProduct(id)
      .then((product) => {
        if (cancelled) return
        setName(product.name)
        setDescription(product.description)
        setCategory(product.category._id)
        setPrice(product.price)
        setCompareAtPrice(product.compareAtPrice)
        setCurrency(product.currency ?? DEFAULT_CURRENCY)
        setImages(product.images)
        setSizes(product.sizes)
        setIsMadeToMeasure(product.isMadeToMeasure)
        setStock(product.stock)
        setDisplayStyle(product.displayStyle ?? '')
        setTags(product.tags.join(', '))
        setIsActive(product.isActive)
        setIsFeatured(product.isFeatured)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load product.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [id])

  function toggleSize(size: string) {
    setSizes((current) =>
      current.includes(size) ? current.filter((item) => item !== size) : [...current, size],
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!name.ar.trim()) {
      setError('The Arabic name is required.')
      return
    }
    if (!category) {
      setError('Please choose a category.')
      return
    }
    if (price === undefined || price < 0) {
      setError('A valid price is required.')
      return
    }

    const parsedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const payload: ProductPayload = {
      name,
      description,
      category,
      price,
      currency: currency.trim().toUpperCase() || DEFAULT_CURRENCY,
      images,
      sizes,
      isMadeToMeasure,
      stock,
      tags: parsedTags,
      isActive,
      isFeatured,
    }
    if (compareAtPrice !== undefined) {
      payload.compareAtPrice = compareAtPrice
    }
    if (displayStyle) {
      payload.displayStyle = displayStyle as DisplayStyle
    }

    setSaving(true)
    try {
      if (id) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }
      navigate('/admin/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product.')
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="font-sans text-sm text-ink/60">Loading</p>
  }

  return (
    <div className="max-w-2xl">
      <Link
        to="/admin/products"
        className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
      >
        Back to products
      </Link>

      <h1 className="mt-4 font-display text-3xl text-ink">
        {isEdit ? 'Edit product' : 'New product'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <LocalizedInput label="Name" value={name} onChange={setName} required />
        <LocalizedInput label="Description" value={description} onChange={setDescription} multiline />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Category">
            <Select
              value={category}
              onChange={setCategory}
              placeholder="Choose a category"
              options={categories.map((item) => ({
                value: item._id,
                label: item.parent
                  ? `${item.parent.name.ar} > ${item.name.ar}`
                  : item.name.ar,
              }))}
            />
          </Field>

          <Field label="Display style" hint="Leave empty to inherit from the category.">
            <Select
              value={displayStyle}
              onChange={setDisplayStyle}
              placeholder="Inherit from category"
              options={DISPLAY_STYLES.map((style) => ({
                value: style,
                label: DISPLAY_STYLE_LABELS[style],
              }))}
            />
          </Field>

          <Field label={`Price (${currency || DEFAULT_CURRENCY})`}>
            <NumberInput value={price} onChange={setPrice} min={0} step={0.01} />
          </Field>

          <Field label="Compare at price" hint="Optional original price for a discount label.">
            <NumberInput value={compareAtPrice} onChange={setCompareAtPrice} min={0} step={0.01} />
          </Field>

          <Field label="Currency" hint="ISO 4217 code.">
            <input
              type="text"
              value={currency}
              maxLength={3}
              onChange={(event) => setCurrency(event.target.value.toUpperCase())}
              className={inputClass}
            />
          </Field>

          <Field label="Stock">
            <NumberInput value={stock} onChange={setStock} min={0} />
          </Field>
        </div>

        <div>
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">Sizes</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {DARAA_SIZES.map((size) => {
              const active = sizes.includes(size)
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`rounded-brand border px-4 py-2 font-sans text-sm transition-colors ${
                    active
                      ? 'border-gold bg-gold text-cream-card'
                      : 'border-line text-ink/70 hover:border-gold hover:text-gold'
                  }`}
                >
                  {size}
                </button>
              )
            })}
          </div>
        </div>

        <ImageUploader
          label="Images"
          value={images}
          onChange={setImages}
          folder="classy-men/products"
          multiple
          withRole
        />

        <Field label="Tags" hint="Comma separated, e.g. new, summer, cotton.">
          <input
            type="text"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="space-y-3">
          <Checkbox
            checked={isMadeToMeasure}
            onChange={setIsMadeToMeasure}
            label="Made to measure"
          />
          <Checkbox checked={isActive} onChange={setIsActive} label="Active on the storefront" />
          <Checkbox checked={isFeatured} onChange={setIsFeatured} label="Featured" />
        </div>

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
            to="/admin/products"
            className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
