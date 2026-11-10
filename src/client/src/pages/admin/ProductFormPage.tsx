import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DEFAULT_CURRENCY } from '@shared/constants/catalog'
import type { DisplayStyle } from '@shared/constants/displayStyles'
import type { WardrobeSection } from '@shared/schemas/product.schema'
import { useApp } from '../../app/useApp'
import { pickText } from '../../lib/localized'
import { Checkbox, Field, NumberInput, Select, inputClass } from '../../components/admin/form'
import { LocalizedInput } from '../../components/admin/LocalizedInput'
import { ImageUploader } from '../../components/admin/ImageUploader'
import { SizeManager } from '../../components/admin/SizeManager'
import { ProductPreviewModal } from '../../components/admin/ProductPreviewModal'
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
  const { t, locale } = useApp()
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
  const [tags, setTags] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle | ''>('')
  const [wardrobeSection, setWardrobeSection] = useState<WardrobeSection>('hanging')

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    if (!id) return

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
        setTags(product.tags.join(', '))
        setIsActive(product.isActive)
        setIsFeatured(product.isFeatured)
        if (product.displayStyle) setDisplayStyle(product.displayStyle)
        if (product.wardrobeSection) setWardrobeSection(product.wardrobeSection)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load product.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  /** The selected Category object (for preview and label resolution). */
  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === category) ?? null,
    [categories, category],
  )

  /** Validation — returns an error string or null */
  function validate(): string | null {
    if (!name.ar.trim()) return t('admin.arabicNameRequired')
    if (!category) return t('admin.categoryRequired')
    if (price === undefined || price < 0) return t('admin.priceRequired')
    return null
  }

  /** Open the preview modal — validates first */
  function handlePreviewClick(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const err = validate()
    if (err) {
      setError(err)
      return
    }
    setError(null)
    setShowPreview(true)
  }

  /** Called from the modal's confirm button */
  async function handleConfirmSave() {
    const parsedTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    const payload: ProductPayload = {
      name,
      description,
      category,
      price: price!,
      currency: currency.trim().toUpperCase() || DEFAULT_CURRENCY,
      images,
      sizes,
      isMadeToMeasure,
      stock,
      tags: parsedTags,
      isActive,
      isFeatured,
      displayStyle: isFeatured && displayStyle ? (displayStyle as DisplayStyle) : undefined,
      wardrobeSection: isFeatured && displayStyle === 'wardrobe' ? wardrobeSection : undefined,
    }
    if (compareAtPrice !== undefined) {
      payload.compareAtPrice = compareAtPrice
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
      setShowPreview(false)
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="font-sans text-sm text-ink/60">Loading...</p>
  }

  return (
    <>
      <div className="max-w-2xl">
        <Link
          to="/admin/products"
          className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
        >
          {t('admin.backToProducts')}
        </Link>

        <h1 className="mt-4 font-display text-3xl text-ink">
          {isEdit ? t('admin.editProduct') : t('admin.newProduct')}
        </h1>

        {/* Category scene preview badge */}
        {selectedCategory && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-brand border border-line/60 bg-cream-card px-3 py-1.5">
            <span className="font-sans text-[11px] text-ink/50">
              {pickText(selectedCategory.name, locale)}
            </span>
            <span className="h-3 w-px bg-line" />
            <span className="font-sans text-[11px] font-semibold text-gold uppercase tracking-wider">
              {selectedCategory.displayStyle}
            </span>
          </div>
        )}

        <form onSubmit={handlePreviewClick} className="mt-6 space-y-6">
          <LocalizedInput label={t('admin.productName')} value={name} onChange={setName} required />
          <LocalizedInput label={t('admin.productDescription')} value={description} onChange={setDescription} multiline />

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label={t('admin.category')} hint={t('admin.categoryHint')}>
              <Select
                value={category}
                onChange={setCategory}
                placeholder={t('admin.chooseCategory')}
                options={categories.map((item) => ({
                  value: item._id,
                  label: item.parent
                    ? `${pickText(item.parent.name, locale)} › ${pickText(item.name, locale)}`
                    : pickText(item.name, locale),
                }))}
              />
            </Field>

            <Field label={`${t('admin.price')} (${currency || DEFAULT_CURRENCY})`}>
              <NumberInput value={price} onChange={setPrice} min={0} step={0.01} />
            </Field>

            <Field label={t('admin.compareAtPrice')} hint={t('admin.compareAtPriceHint')}>
              <NumberInput value={compareAtPrice} onChange={setCompareAtPrice} min={0} step={0.01} />
            </Field>

            <Field label={t('admin.currency')} hint={t('admin.currencyHint')}>
              <input
                type="text"
                value={currency}
                maxLength={3}
                onChange={(event) => setCurrency(event.target.value.toUpperCase())}
                className={inputClass}
              />
            </Field>

            <Field label={t('admin.stock')}>
              <NumberInput value={stock} onChange={setStock} min={0} />
            </Field>
          </div>

          <SizeManager selectedSizes={sizes} onChange={setSizes} />

          {/* Images — scene-aware slots when featured on homepage, standard slots otherwise */}
          <ImageUploader
            label={t('admin.photoSlotsTitle')}
            hint={isFeatured ? t('admin.photoSlotsHint') : 'Upload standard product photos.'}
            displayStyle={isFeatured ? ((displayStyle || selectedCategory?.displayStyle || 'rail') as DisplayStyle) : null}
            wardrobeSection={isFeatured && displayStyle === 'wardrobe' ? wardrobeSection : undefined}
            value={images}
            onChange={setImages}
            folder="classy-men/products"
            removeBackground
          />

          <Field label={t('admin.tags')} hint={t('admin.tagsHint')}>
            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              className={inputClass}
            />
          </Field>

          <div className="space-y-4 rounded-brand border border-line p-4 bg-cream/30">
            <Checkbox
              checked={isMadeToMeasure}
              onChange={setIsMadeToMeasure}
              label={t('admin.madeToMeasure')}
            />
            <Checkbox
              checked={isActive}
              onChange={setIsActive}
              label={t('admin.activeStorefront')}
            />

            <div className="pt-2 border-t border-line/60">
              <Checkbox
                checked={isFeatured}
                onChange={(checked) => {
                  setIsFeatured(checked)
                  if (checked && !displayStyle) {
                    setDisplayStyle((selectedCategory?.displayStyle as DisplayStyle) || 'rail')
                  }
                }}
                label={t('admin.featuredHomepage')}
              />
              <p className="ms-6 mt-1 font-sans text-xs text-ink/60">
                {t('admin.featuredHomepageHint')}
              </p>

              {/* Showcase Scene Selector — only visible when Featured is checked */}
              {isFeatured && (
                <div className="ms-6 mt-3.5 p-3.5 rounded-xl border border-gold/40 bg-gold/5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-xs font-bold text-gold-dark dark:text-gold uppercase tracking-wider">
                      {locale === 'ar' ? 'اختر نمط العرض في الصفحة الرئيسية' : 'Select Homepage Scene Style'}
                    </span>
                    <span className="font-mono text-[10px] text-ink/50 uppercase font-semibold">
                      {displayStyle || selectedCategory?.displayStyle || 'rail'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'rail', label: locale === 'ar' ? 'علاقة متحركة (Rail)' : locale === 'fr' ? 'Rail de vêtements' : 'Clothes Rail (Rail)' },
                      { id: 'wardrobe', label: locale === 'ar' ? 'خزانة ملابس (Wardrobe)' : locale === 'fr' ? 'Garde-robe 3D' : 'Wardrobe (Dolap)' },
                      { id: 'mannequin', label: locale === 'ar' ? 'مانيكان (Mannequin)' : locale === 'fr' ? 'Mannequin 3D' : 'Mannequin (Manken)' },
                      { id: 'cabinet', label: locale === 'ar' ? 'خزانة زجاجية (Cabinet)' : locale === 'fr' ? 'Vitrine en Verre' : 'Glass Cabinet (Cam Dolap)' },
                      { id: 'floating', label: locale === 'ar' ? 'طافي (Floating)' : locale === 'fr' ? 'Cartes Flottantes' : 'Floating (Havada)' },
                      { id: 'shelf', label: locale === 'ar' ? 'رف طاولة (Shelf)' : locale === 'fr' ? 'Étagère Prestige' : 'Shelf (Butik Tezgah)' },
                      { id: 'stage-3d', label: locale === 'ar' ? 'منصة ثلاثية الأبعاد (Stage 3D)' : locale === 'fr' ? 'Scène 3D Interactive' : 'Interactive 3D Stage' },
                    ].map((opt) => {
                      const isSelected = (displayStyle || selectedCategory?.displayStyle || 'rail') === opt.id
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setDisplayStyle(opt.id as DisplayStyle)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-sans text-xs text-start transition-all border ${
                            isSelected
                              ? 'border-gold bg-gold/20 text-gold-dark dark:text-gold-light font-bold shadow-xs'
                              : 'border-line/60 bg-cream-card/70 text-ink/70 hover:border-gold/40 hover:bg-gold/10'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${
                              isSelected ? 'bg-gold animate-pulse' : 'bg-ink/20'
                            }`}
                          />
                          <span className="line-clamp-1">{opt.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {/* ── Wardrobe Sub-Section Selector ── */}
                  {(displayStyle || selectedCategory?.displayStyle || 'rail') === 'wardrobe' && (
                    <div className="mt-3 p-3 rounded-lg border border-amber-700/40 bg-amber-900/10 space-y-2">
                      <span className="font-sans text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                        {locale === 'ar'
                          ? 'موقع المنتج في الخزانة'
                          : locale === 'fr'
                          ? 'Emplacement dans la garde-robe'
                          : 'Wardrobe Compartment'}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {([
                          {
                            id: 'hanging' as WardrobeSection,
                            ar: 'مقطع العلاقة (أعلى)\nملابس معلقة — صورة أمامية + خلفية',
                            fr: 'Tringle supérieure (suspendu)\nVêtements suspendus — Photo avant + arrière',
                            en: 'Hanging Rod (Top)\nSuspended garments — Front + Back photo',
                          },
                          {
                            id: 'folded' as WardrobeSection,
                            ar: 'رف الملابس المطوية (وسط)\nمطوية على الرف — صورة علوية مسطحة',
                            fr: 'Étagère pliée (milieu)\nVêtements pliés — Photo à plat par dessus',
                            en: 'Folded Shelf (Middle)\nFolded clothes on shelf — Flat-lay top-down photo',
                          },
                          {
                            id: 'bottom' as WardrobeSection,
                            ar: 'القسم السفلي (أسفل)\nأحذية / عطور / إكسسوارات — صورة بطولية',
                            fr: 'Compartiment bas (bas)\nChaussures / Parfums / Accessoires — Photo hero',
                            en: 'Bottom Compartment (Floor)\nShoes / Perfumes / Accessories — Hero shot',
                          },
                        ] as const).map((section) => {
                          const isSelected = wardrobeSection === section.id
                          const lines = (locale === 'ar' ? section.ar : locale === 'fr' ? section.fr : section.en).split('\n')
                          return (
                            <button
                              key={section.id}
                              type="button"
                              onClick={() => setWardrobeSection(section.id)}
                              className={`flex flex-col items-start gap-1 px-3 py-2.5 rounded-lg font-sans text-xs text-start transition-all border ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-500/20 text-amber-800 dark:text-amber-200 font-bold shadow-xs'
                                  : 'border-amber-900/30 bg-black/10 text-amber-700/80 dark:text-amber-400/70 hover:border-amber-500/40 hover:bg-amber-900/15'
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full shrink-0 self-start mt-0.5 ${isSelected ? 'bg-amber-500 animate-pulse' : 'bg-amber-700/40'}`} />
                              <span className="font-bold leading-tight">{lines[0]}</span>
                              {lines[1] && (
                                <span className="text-[10px] opacity-70 leading-tight">{lines[1]}</span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-brand border border-gold px-4 py-3 font-sans text-sm text-gold-dark">
              {error}
            </p>
          )}

          <div className="flex items-center gap-4">
            {/* Primary: Preview in Scene */}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-brand bg-gold px-6 py-3 font-sans text-sm uppercase tracking-[0.2em] text-cream-card shadow-sm transition-all hover:bg-gold-dark hover:scale-[1.01] active:scale-[0.99] font-bold"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('admin.previewScene')}
            </button>

            <Link
              to="/admin/products"
              className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
            >
              {t('admin.cancel')}
            </Link>

            {/* Preview hint */}
            <p className="hidden lg:block font-sans text-[11px] text-ink/40 italic ms-auto">
              {t('admin.previewHint')}
            </p>
          </div>
        </form>
      </div>

      {/* ── Full-screen Scene Preview Modal ── */}
      <ProductPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirmSave={handleConfirmSave}
        saving={saving}
        draft={{
          name,
          description,
          price: price ?? 0,
          currency: currency || DEFAULT_CURRENCY,
          sizes,
          images,
          isFeatured,
          isMadeToMeasure,
          stock: stock ?? 0,
          tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        }}
        category={selectedCategory}
      />
    </>
  )
}
