import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue } from 'framer-motion'
import { useApp } from '../../app/useApp'
import { useCart } from '../../app/useCart'
import { useToast } from '../../app/useToast'
import { pickText } from '../../lib/localized'
import { formatPrice } from '../catalog/ProductCard'
import type { Category, Product, ProductImageAsset } from '../../lib/catalog'

interface Stage3dShowcaseProps {
  category?: Category | CategorySummary | { _id?: string; slug?: string; name: LocalizedText; description?: LocalizedText }
  products: Product[]
}

const LUXURY_PALETTES = [
  {
    accent: '#c99a52',
    gradient: 'radial-gradient(circle at center, rgba(201,154,82,0.50) 0%, rgba(160,116,52,0.22) 45%, transparent 75%)',
  },
  {
    accent: '#d97736',
    gradient: 'radial-gradient(circle at center, rgba(217,119,54,0.48) 0%, rgba(180,83,9,0.22) 45%, transparent 75%)',
  },
  {
    accent: '#4f46e5',
    gradient: 'radial-gradient(circle at center, rgba(79,70,229,0.42) 0%, rgba(30,27,75,0.28) 50%, transparent 75%)',
  },
  {
    accent: '#10b981',
    gradient: 'radial-gradient(circle at center, rgba(16,185,129,0.40) 0%, rgba(6,78,59,0.22) 50%, transparent 75%)',
  },
]

/**
 * Ensures Cloudinary images have white backgrounds stripped on the fly.
 */
function ensureTransparentUrl(url?: string): string {
  if (!url) return ''
  if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
    if (!url.includes('e_make_transparent')) {
      return url.replace('/image/upload/', '/image/upload/e_make_transparent:20,f_auto,q_auto/')
    }
  }
  return url
}

/**
 * Selects the image asset closest to the current rotation angle.
 */
function getAngleImage(images: ProductImageAsset[], deg: number): { image: ProductImageAsset; mirrored: boolean } {
  if (images.length === 0) return { image: { url: '' }, mirrored: false }
  if (images.length === 1) return { image: images[0], mirrored: false }

  const normalized = ((deg % 360) + 360) % 360

  if (images.length === 2) {
    if (normalized >= 90 && normalized <= 270) {
      return { image: images[1], mirrored: false }
    }
    return { image: images[0], mirrored: false }
  }

  if (images.length === 3) {
    if (normalized >= 60 && normalized < 180) {
      return { image: images[1], mirrored: false }
    }
    if (normalized >= 180 && normalized < 300) {
      return { image: images[2], mirrored: false }
    }
    return { image: images[0], mirrored: false }
  }

  // 4 or more angle images (0° Front, 45° Angle, 90° Side, 180° Back)
  if (normalized >= 25 && normalized < 70) {
    return { image: images[1] || images[0], mirrored: false }
  }
  if (normalized >= 70 && normalized < 140) {
    return { image: images[2] || images[0], mirrored: false }
  }
  if (normalized >= 140 && normalized < 220) {
    return { image: images[3] || images[2] || images[0], mirrored: false }
  }
  if (normalized >= 220 && normalized < 290) {
    return { image: images[2] || images[0], mirrored: true }
  }
  if (normalized >= 290 && normalized < 335) {
    return { image: images[1] || images[0], mirrored: true }
  }
  return { image: images[0], mirrored: false }
}

export function Stage3dShowcase({ category, products }: Stage3dShowcaseProps) {
  const { t, locale } = useApp()
  const { add } = useCart()
  const { luxury: toastLuxury } = useToast()

  // Normalize: when no category provided, derive from first product's category or use stub
  const resolvedCategory = category ?? products[0]?.category ?? {
    _id: 'featured',
    slug: 'catalog',
    name: { ar: 'المجموعة المميزة', fr: 'Collection Prestige', en: 'Featured Collection' },
    description: undefined,
  }

  const [activeIdx, setActiveIdx] = useState(0)
  const [rotationDeg, setRotationDeg] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragStartDeg = useRef(0)

  // Mouse tilt tracking
  const stageRef = useRef<HTMLDivElement>(null)
  const turntableContainerRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const rotateXMotion = useMotionValue(0)

  // Reset rotation when switching products
  useEffect(() => {
    setRotationDeg(0)
  }, [activeIdx])

  // Scroll wheel rotation support
  useEffect(() => {
    const el = turntableContainerRef.current
    if (!el) return
    function handleWheel(e: WheelEvent) {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (Math.abs(delta) > 1) {
        e.preventDefault()
        setRotationDeg((prev) => prev + delta * 0.45)
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  if (products.length === 0) {
    return null
  }

  const hasMultiple = products.length > 1
  const prevIdx = (activeIdx - 1 + products.length) % products.length
  const nextIdx = (activeIdx + 1) % products.length
  const prevProduct = hasMultiple ? products[prevIdx] : null
  const nextProduct = hasMultiple ? products[nextIdx] : null

  const current = products[Math.min(activeIdx, products.length - 1)]
  const palette = LUXURY_PALETTES[activeIdx % LUXURY_PALETTES.length]
  const currentName = pickText(current.name, locale)
  const currentDesc = pickText(current.description, locale)
  const watermarkText = (current.name.en || current.name.fr || current.slug).toUpperCase()

  const { image: activeImage, mirrored } = getAngleImage(current.images, rotationDeg)
  const cleanImageUrl = ensureTransparentUrl(activeImage.url)

  // Interactive turntable drag handlers
  function handlePointerDown(e: React.PointerEvent) {
    setIsDragging(true)
    dragStartX.current = e.clientX
    dragStartDeg.current = rotationDeg
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return
    const deltaX = e.clientX - dragStartX.current
    const nextDeg = dragStartDeg.current + deltaX * 0.75
    setRotationDeg(nextDeg)
  }

  function handlePointerUp() {
    setIsDragging(false)
  }

  function handleStageMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!stageRef.current || isDragging) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const rotY = (x / (rect.width / 2)) * 10
    const rotX = -(y / (rect.height / 2)) * 10
    setTilt({ rotateX: rotX, rotateY: rotY })
    rotateXMotion.set(rotX)
  }

  function handleStageMouseLeave() {
    if (!isDragging) {
      setTilt({ rotateX: 0, rotateY: 0 })
      rotateXMotion.set(0)
    }
  }

  function handleAddToCart() {
    add(
      {
        productId: current._id,
        slug: current.slug,
        name: current.name,
        price: current.price,
        currency: current.currency,
        image: cleanImageUrl,
        size: current.sizes[0],
      },
      1,
    )
    toastLuxury(
      locale === 'ar' ? 'تمت الإضافة إلى السلة' : locale === 'fr' ? 'Ajouté au panier' : 'Added to cart',
      currentName,
      4000,
    )
  }

  const localizedLabels = {
    ar: {
      categoryTag: pickText(resolvedCategory.name, 'ar'),
      specsHeader: 'المواصفات والتفاصيل الفاخرة',
      craftsmanship: 'الحرفية والأصالة',
      composition: 'التكوين والنسيج',
      availability: 'الحالة والمقاسات',
      inStock: 'متوفر للطلب المباشر',
      addToCart: 'إضافة إلى السلة',
      explore: 'تفاصيل المنتج',
      switchHint: 'اختر قطعة لعرض تفاصيلها الملكية',
      viewAll: 'عرض كامل القسم',
      degrees: 'زاوية الرؤية',
      prev: 'السابق',
      next: 'التالي',
    },
    fr: {
      categoryTag: pickText(resolvedCategory.name, 'fr'),
      specsHeader: 'Caractéristiques & Détails de Prestige',
      craftsmanship: 'Artisanat & Origine',
      composition: 'Composition & Noblesse',
      availability: 'Disponibilité & Tailles',
      inStock: 'En stock • Prêt pour expédition',
      addToCart: 'Ajouter au panier',
      explore: 'Découvrir la pièce',
      switchHint: 'Sélectionnez un article pour afficher son aura',
      viewAll: 'Voir toute la collection',
      degrees: 'Angle de vue',
      prev: 'Précédent',
      next: 'Suivant',
    },
    en: {
      categoryTag: pickText(resolvedCategory.name, 'en'),
      specsHeader: 'Prestige Specifications & Craft',
      craftsmanship: 'Artisanal Heritage',
      composition: 'Materials & Signature',
      availability: 'Status & Sizing',
      inStock: 'In Stock • Ready for Delivery',
      addToCart: 'Add to Cart',
      explore: 'Explore Piece',
      switchHint: 'Select a piece to reveal its signature presentation',
      viewAll: 'Explore Category',
      degrees: 'Viewing Angle',
      prev: 'Previous',
      next: 'Next',
    },
  }[locale]

  const normalizedDeg = Math.round((((rotationDeg % 360) + 360) % 360))

  return (
    <section className="relative w-full overflow-hidden bg-[#090807] py-20 lg:py-28 text-cream-card selection:bg-gold selection:text-ink">
      {/* ── 1. DYNAMIC COLOR AURA (Atmospheric Lighting) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current._id}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="h-[650px] w-[650px] sm:h-[800px] sm:w-[800px] rounded-full blur-3xl opacity-75"
            style={{ background: palette.gradient }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(201,154,82,0.15)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
        </motion.div>
      </AnimatePresence>

      {/* ── 2. GIANT WATERMARK TYPOGRAPHY ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-10 select-none"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={current._id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 1.05 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[15vw] font-black tracking-widest text-cream-card uppercase whitespace-nowrap"
          >
            {watermarkText}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 font-sans text-xs uppercase tracking-[0.3em] text-gold-light">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-ping" />
            {localizedLabels.categoryTag}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl text-cream-card">
            {pickText(resolvedCategory.name, locale)}
          </h2>
          {resolvedCategory.description && (
            <p className="mx-auto max-w-2xl font-text text-sm sm:text-base text-cream-card/70">
              {pickText(resolvedCategory.description, locale)}
            </p>
          )}
        </div>

        {/* ── 3. MAIN 3D ATELIER STAGE ── */}
        <div
          ref={stageRef}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
          className="relative mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center min-h-[600px] rounded-2xl border border-gold/20 bg-[#120f0c]/70 p-6 sm:p-10 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.85)] [perspective:1400px]"
        >
          {/* Left Column: Specifications / Notes Panel */}
          <div className="lg:col-span-5 z-10 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current._id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-5"
              >
                <div>
                  <span
                    className="inline-block rounded-full px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-widest text-ink shadow-sm"
                    style={{ backgroundColor: palette.accent }}
                  >
                    {current.sizes[0] ? `${current.sizes[0]}` : 'Signature Collection'}
                  </span>
                  <h3 className="mt-3 font-display text-2xl sm:text-3xl text-cream-card leading-tight">
                    {currentName}
                  </h3>
                  {currentDesc && (
                    <p className="mt-2 font-text text-sm text-cream-card/70 leading-relaxed">
                      {currentDesc}
                    </p>
                  )}
                </div>

                {/* Details Card */}
                <div className="space-y-3.5 rounded-xl border border-gold/30 bg-black/50 p-4 sm:p-5 backdrop-blur-md">
                  <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-gold font-semibold flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    {localizedLabels.specsHeader}
                  </p>

                  <div className="border-b border-gold/15 pb-2.5">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-cream-card/50">
                      {localizedLabels.craftsmanship}
                    </span>
                    <p className="font-sans text-xs sm:text-sm font-medium text-cream-card mt-0.5">
                      {current.isMadeToMeasure
                        ? (locale === 'ar' ? 'خياطة حسب الطلب • تفصيل يدوي فاخر' : locale === 'fr' ? 'Sur-mesure • Atelier artisanal' : 'Bespoke tailoring • Handcrafted')
                        : (locale === 'ar' ? 'تصميم حصري • دار Classy Men Rim' : locale === 'fr' ? 'Design exclusif • Maison Classy Men' : 'Exclusive design • Maison Classy Men')}
                    </p>
                  </div>

                  {current.tags.length > 0 && (
                    <div className="border-b border-gold/15 pb-2.5">
                      <span className="font-sans text-[10px] uppercase tracking-wider text-gold-light/80">
                        {localizedLabels.composition}
                      </span>
                      <p className="font-sans text-xs sm:text-sm font-semibold text-gold-light mt-0.5 capitalize">
                        {current.tags.join(' • ')}
                      </p>
                    </div>
                  )}

                  <div className="pt-1">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-cream-card/50">
                      {localizedLabels.availability}
                    </span>
                    <p className="font-sans text-xs text-cream-card/80 mt-0.5">
                      {localizedLabels.inStock} {current.sizes.length > 0 && `(${current.sizes.join(', ')})`}
                    </p>
                  </div>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <div>
                    <span className="font-display text-2xl font-bold text-gold">
                      {formatPrice(current.price, current.currency)}
                    </span>
                    {current.compareAtPrice && (
                      <span className="ms-2 font-sans text-xs text-cream-card/40 line-through">
                        {formatPrice(current.compareAtPrice, current.currency)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 min-w-[160px] rounded-brand bg-gradient-to-r from-gold via-gold-light to-gold px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] font-bold text-ink shadow-[0_4px_20px_rgba(201,154,82,0.35)] hover:shadow-[0_6px_25px_rgba(201,154,82,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {localizedLabels.addToCart}
                  </button>

                  <Link
                    to={`/product/${current.slug}`}
                    className="rounded-brand border border-gold/40 px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] text-gold hover:border-gold hover:bg-gold/10 transition-colors"
                  >
                    {localizedLabels.explore} →
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: 360° Interactive Arena with Previous & Next in 3D */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center relative min-h-[460px] sm:min-h-[520px]">
            {/* Top instruction badge */}
            <div className="absolute top-0 z-30 flex items-center gap-2 rounded-full border border-gold/30 bg-black/70 px-4 py-1.5 text-[11px] font-sans text-gold-light backdrop-blur-md shadow-md">
              <svg className="w-3.5 h-3.5 text-gold animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              <span>{t('admin.dragToRotate')}</span>
              <span className="ms-1 font-mono font-bold text-gold px-1.5 py-0.2 rounded bg-gold/20">
                {normalizedDeg}°
              </span>
            </div>

            {/* 3D ARENA STAGE (Flanking Items + Center Turntable) */}
            <motion.div
              drag={products.length > 1 ? 'x' : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                const THRESHOLD = 60
                const dx = info.offset.x
                const vx = info.velocity.x
                const isRtl = locale === 'ar'
                const goNext = isRtl ? dx > THRESHOLD || vx > 400 : dx < -THRESHOLD || vx < -400
                const goPrev = isRtl ? dx < -THRESHOLD || vx < -400 : dx > THRESHOLD || vx > 400
                if (goNext && nextProduct) setActiveIdx(nextIdx)
                else if (goPrev && prevProduct) setActiveIdx(prevIdx)
              }}
              className="relative w-full flex items-center justify-center py-6 sm:py-8 [perspective:1200px] cursor-grab active:cursor-grabbing select-none"
            >
              {/* ── Left Flank: Previous Product in 3D ── */}
              {prevProduct && (
                <div
                  onClick={() => setActiveIdx(prevIdx)}
                  role="button"
                  tabIndex={0}
                  className="group absolute start-0 sm:start-2 z-20 flex flex-col items-center text-center opacity-40 hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    transform: 'perspective(1000px) rotateY(26deg) translateZ(-50px)',
                  }}
                  title={pickText(prevProduct.name, locale)}
                >
                  <div className="relative h-44 sm:h-56 w-24 sm:w-32 flex items-center justify-center pointer-events-none">
                    {prevProduct.images[0]?.url ? (
                      <img
                        src={ensureTransparentUrl(prevProduct.images[0].url)}
                        alt={pickText(prevProduct.name, locale)}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] filter brightness-90 group-hover:brightness-110 transition-all"
                      />
                    ) : (
                      <div className="h-28 w-20 rounded border border-gold/30 bg-gold/5 flex items-center justify-center text-gold/60 text-xs">
                        CMR
                      </div>
                    )}
                  </div>

                  <span className="font-display text-xs text-cream-card line-clamp-1 max-w-[90px] sm:max-w-[120px] mt-1 pointer-events-none">
                    {pickText(prevProduct.name, locale)}
                  </span>
                </div>
              )}

              {/* ── Center: Interactive 360° Turntable (Drag & Scroll Wheel) ── */}
              <div
                ref={turntableContainerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className={`relative z-20 flex flex-col items-center justify-center select-none touch-none px-12 sm:px-20 ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
              >
                {/* Glow backdrop aura */}
                <div
                  className="absolute h-80 w-80 rounded-full blur-2xl opacity-60 pointer-events-none"
                  style={{ backgroundColor: palette.accent }}
                />

                {/* 3D Model Image with Perspective & Dynamic Rotation */}
                <motion.div
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY + (current.images.length <= 1 ? (rotationDeg % 360) * 0.4 : 0)}deg)`,
                  }}
                  className="relative z-10 flex flex-col items-center"
                >
                  {cleanImageUrl ? (
                    <img
                      src={cleanImageUrl}
                      alt={currentName}
                      style={{
                        transform: mirrored ? 'scaleX(-1)' : 'none',
                      }}
                      className="h-64 sm:h-80 md:h-96 w-auto max-w-full object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)] filter brightness-105 contrast-110 pointer-events-none transition-transform duration-100"
                      draggable={false}
                    />
                  ) : (
                    <div className="h-64 sm:h-80 w-56 rounded-2xl border-2 border-dashed border-gold/30 flex items-center justify-center text-gold/50 font-sans text-sm">
                      No image available
                    </div>
                  )}

                  {/* Glossy Floor Reflection with Gradient Fade */}
                  {cleanImageUrl && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none -mt-4 h-32 sm:h-36 w-full overflow-hidden opacity-25 filter blur-[0.5px]"
                      style={{
                        transform: `scaleY(-1) ${mirrored ? 'scaleX(-1)' : ''}`,
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 80%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 80%)',
                      }}
                    >
                      <img
                        src={cleanImageUrl}
                        alt=""
                        className="h-64 sm:h-80 md:h-96 w-auto max-w-full object-contain mx-auto"
                        draggable={false}
                      />
                    </div>
                  )}
                </motion.div>

                {/* ── 3D Turntable Pedestal Dial ── */}
                <div
                  className="relative -mt-6 sm:-mt-8 h-12 w-64 sm:w-80 md:w-96 rounded-full border border-gold/40 bg-gradient-to-r from-transparent via-gold/25 to-transparent shadow-[0_0_30px_rgba(201,154,82,0.35)] flex items-center justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <div
                    className="absolute inset-0 rounded-full border border-gold/25 flex items-center justify-between px-6"
                    style={{ transform: `rotate(${rotationDeg}deg)` }}
                  >
                    <span className="h-2 w-0.5 bg-gold shadow-[0_0_6px_#c99a52]" />
                    <span className="h-1.5 w-0.5 bg-gold/50" />
                    <span className="h-2 w-0.5 bg-gold shadow-[0_0_6px_#c99a52]" />
                    <span className="h-1.5 w-0.5 bg-gold/50" />
                  </div>
                </div>
              </div>

              {/* ── Right Flank: Next Product in 3D ── */}
              {nextProduct && (
                <div
                  onClick={() => setActiveIdx(nextIdx)}
                  role="button"
                  tabIndex={0}
                  className="group absolute end-0 sm:end-2 z-20 flex flex-col items-center text-center opacity-40 hover:opacity-100 transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    transform: 'perspective(1000px) rotateY(-26deg) translateZ(-50px)',
                  }}
                  title={pickText(nextProduct.name, locale)}
                >
                  <div className="relative h-44 sm:h-56 w-24 sm:w-32 flex items-center justify-center pointer-events-none">
                    {nextProduct.images[0]?.url ? (
                      <img
                        src={ensureTransparentUrl(nextProduct.images[0].url)}
                        alt={pickText(nextProduct.name, locale)}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)] filter brightness-90 group-hover:brightness-110 transition-all"
                      />
                    ) : (
                      <div className="h-28 w-20 rounded border border-gold/30 bg-gold/5 flex items-center justify-center text-gold/60 text-xs">
                        CMR
                      </div>
                    )}
                  </div>

                  <span className="font-display text-xs text-cream-card line-clamp-1 max-w-[90px] sm:max-w-[120px] mt-1 pointer-events-none">
                    {pickText(nextProduct.name, locale)}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Quick-Preset Angle Buttons */}
            {current.images.length > 1 && (
              <div className="mt-3 flex items-center gap-2 z-20">
                {[
                  { deg: 0, label: '0° Hero' },
                  { deg: 45, label: '45°' },
                  { deg: 90, label: '90°' },
                  { deg: 180, label: '180°' },
                ].map((item) => (
                  <button
                    key={item.deg}
                    type="button"
                    onClick={() => setRotationDeg(item.deg)}
                    className={`rounded-full px-2.5 py-1 font-sans text-[10px] font-mono transition-all ${
                      Math.abs(normalizedDeg - item.deg) < 20
                        ? 'bg-gold text-ink font-bold shadow-[0_0_12px_rgba(201,154,82,0.5)]'
                        : 'border border-gold/30 bg-black/50 text-cream-card/70 hover:border-gold hover:text-gold'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── 4. ARC CAROUSEL / SELECTOR STRIP ── */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-5 px-2">
            <p className="font-sans text-xs uppercase tracking-[0.25em] text-cream-card/60">
              {localizedLabels.switchHint}
            </p>
            <Link
              to={`/category/${resolvedCategory.slug ?? 'catalog'}`}
              className="font-sans text-xs uppercase tracking-[0.2em] text-gold hover:underline"
            >
              {localizedLabels.viewAll} →
            </Link>
          </div>

          <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2">
            {products.map((prod, idx) => {
              const active = idx === activeIdx
              const primaryImg = ensureTransparentUrl(prod.images[0]?.url)
              const pName = pickText(prod.name, locale)
              const pal = LUXURY_PALETTES[idx % LUXURY_PALETTES.length]

              return (
                <button
                  key={prod._id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`group relative flex flex-col items-center rounded-xl p-3 sm:p-4 border transition-all duration-300 ${
                    active
                      ? 'border-gold bg-gold/15 scale-105 shadow-[0_0_25px_rgba(201,154,82,0.4)]'
                      : 'border-white/10 bg-black/40 hover:border-gold/50 hover:bg-gold/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative h-20 w-16 sm:h-24 sm:w-20 flex items-center justify-center">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={pName}
                        className="max-h-full max-w-full object-contain drop-shadow"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-gold/10 flex items-center justify-center text-[10px] text-gold">
                        CMR
                      </div>
                    )}
                    {active && (
                      <span
                        className="absolute inset-0 rounded-full blur-md opacity-40"
                        style={{ backgroundColor: pal.accent }}
                      />
                    )}
                  </div>

                  <span className={`mt-2 font-sans text-xs text-center font-medium line-clamp-1 max-w-[120px] ${active ? 'text-gold-light font-bold' : 'text-cream-card/70'}`}>
                    {pName}
                  </span>

                  <span className="font-mono text-[11px] text-gold/80 mt-0.5">
                    {formatPrice(prod.price, prod.currency)}
                  </span>

                  {active && (
                    <motion.span
                      layoutId={`activeShowcaseIndicator-${resolvedCategory._id ?? 'featured'}`}
                      className="absolute -bottom-1 h-[2px] w-12 bg-gold shadow-[0_0_8px_#c99a52]"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
