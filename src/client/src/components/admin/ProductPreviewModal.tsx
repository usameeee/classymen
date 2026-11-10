import { useEffect, useRef } from 'react'
import { useApp } from '../../app/useApp'
import { SceneRenderer } from '../../scenes/SceneRenderer'
import { Stage3dShowcase } from '../showcase/Stage3dShowcase'
import type { Category, Product, LocalizedText, ProductImageAsset } from '../../lib/catalog'

interface ProductPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmSave: () => void
  saving: boolean
  /** Draft product data from the form */
  draft: {
    name: LocalizedText
    description: LocalizedText
    price: number
    currency: string
    sizes: string[]
    images: ProductImageAsset[]
    isFeatured: boolean
    isMadeToMeasure: boolean
    stock: number
    tags: string[]
  }
  /** The selected category */
  category: Category | null
}

/** Builds a synthetic Product object from draft form data for preview purposes. */
function buildPreviewProduct(draft: ProductPreviewModalProps['draft'], category: Category): Product {
  return {
    _id: '__preview__',
    slug: '__preview__',
    name: draft.name,
    description: draft.description,
    category: {
      _id: category._id,
      slug: category.slug,
      name: category.name,
      displayStyle: category.displayStyle,
    },
    price: draft.price,
    currency: draft.currency,
    images: draft.images,
    sizes: draft.sizes,
    isMadeToMeasure: draft.isMadeToMeasure,
    stock: draft.stock,
    tags: draft.tags,
    isActive: true,
    isFeatured: draft.isFeatured,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function ProductPreviewModal({
  isOpen,
  onClose,
  onConfirmSave,
  saving,
  draft,
  category,
}: ProductPreviewModalProps) {
  const { t, locale } = useApp()
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const hasImages = draft.images.length > 0
  const hasName = draft.name.ar.trim() || draft.name.en.trim() || draft.name.fr.trim()
  const productName = draft.name[locale] || draft.name.ar || draft.name.en || draft.name.fr || '—'

  const previewProducts: Product[] = category
    ? [buildPreviewProduct(draft, category)]
    : []

  const styleName = category?.displayStyle ?? 'grid-clean'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-cream dark:bg-ink overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Product Preview"
    >
      {/* ── Top Bar ── */}
      <div className="flex shrink-0 items-center justify-between border-b border-line/60 bg-cream-card/90 px-6 py-4 shadow-xs backdrop-blur-sm dark:bg-ink/90">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-brand border border-line px-3 py-1.5 font-sans text-xs uppercase tracking-wider text-ink/70 hover:border-gold hover:text-gold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.cancel')}
          </button>

          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.25em] text-ink/50">
              Preview — {styleName}
            </p>
            <p className="font-display text-lg text-ink leading-tight">
              {hasName ? productName : '(Unnamed Product)'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!hasImages && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-brand border border-gold/40 bg-gold/10 px-3 py-1 font-sans text-xs text-gold-dark">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              No images uploaded
            </span>
          )}

          <button
            type="button"
            onClick={onConfirmSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-brand bg-gold px-6 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.25em] text-cream-card shadow-sm transition-all hover:bg-gold-dark hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('admin.saving')}
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t('admin.save')}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Scene Preview Body ── */}
      <div ref={backdropRef} className="flex-1 overflow-y-auto">
        {!category ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3">
              <div className="mx-auto h-16 w-16 rounded-full bg-gold/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
              </div>
              <p className="font-display text-xl text-ink/50">Select a category to preview the scene</p>
              <p className="font-sans text-sm text-ink/40">
                Go back and choose a category — the visual style will appear here.
              </p>
            </div>
          </div>
        ) : !hasImages ? (
          <div className="flex h-full flex-col items-center justify-center gap-8 p-8">
            {/* Category style info banner */}
            <div className="rounded-brand border border-gold/30 bg-gold/5 px-6 py-4 text-center max-w-md">
              <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold mb-1">
                {styleName} Scene
              </p>
              <p className="font-sans text-sm text-ink/70">
                Upload product images to see them rendered in the <strong>{styleName}</strong> scene.
              </p>
            </div>

            {/* Placeholder grid */}
            <div className="w-full max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-brand border-2 border-dashed border-line/60 bg-cream-card/50 flex flex-col items-center justify-center gap-2 opacity-50"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <svg className="w-8 h-8 text-ink/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <p className="font-sans text-[11px] text-ink/30">Image {i}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Live Scene Render ── */
          <div className="min-h-full">
            {/* Category & style badge */}
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-line/30 bg-cream-card/80 px-6 py-2 backdrop-blur-sm">
              <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-ink/50">
                {category.name[locale] || category.name.ar} · {styleName}
              </span>
              <span className="ms-auto font-sans text-[11px] text-ink/40">
                {previewProducts.length} product · {draft.images.length} image{draft.images.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Scene */}
            {styleName === 'stage-3d' ? (
              <Stage3dShowcase
                category={category}
                products={previewProducts}
              />
            ) : (
              <section className="relative w-full py-16 bg-cream">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <SceneRenderer
                    style={category.displayStyle}
                    products={previewProducts}
                    intensity="medium"
                  />
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

