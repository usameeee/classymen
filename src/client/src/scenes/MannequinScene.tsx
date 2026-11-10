import { useState, useRef, useCallback } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { LOCALE_DIRECTION } from '@shared/constants/locales'
import { useApp } from '../app/useApp'
import { useCart } from '../app/useCart'
import { useToast } from '../app/useToast'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

/** Ensures Cloudinary images have white backgrounds stripped on the fly. */
function ensureTransparentUrl(url?: string): string {
  if (!url) return ''
  if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
    if (!url.includes('e_make_transparent')) {
      return url.replace('/image/upload/', '/image/upload/e_make_transparent:20,f_auto,q_auto/')
    }
  }
  return url
}

const TURN_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface HotspotConfig {
  id: number
  slotKey: string
  top: string
  left: string
  labelAr: string
  labelFr: string
  labelEn: string
  sublabelAr: string
  sublabelFr: string
  sublabelEn: string
  priceRatio: number
}

const LOOK_PINS: HotspotConfig[] = [
  {
    id: 1,
    slotKey: 'top',
    top: '28%',
    left: '50%',
    labelAr: 'الدراعة الفاخرة',
    labelFr: 'Daraa Prestige',
    labelEn: 'Prestige Daraa',
    sublabelAr: 'حرير وقطن فاخر مطرز',
    sublabelFr: 'Soie & broderie artisanale',
    sublabelEn: 'Hand-embroidered silk & cotton',
    priceRatio: 1.0,
  },
  {
    id: 2,
    slotKey: 'accessory',
    top: '56%',
    left: '34%',
    labelAr: 'أزبي وشيلان تقليدية',
    labelFr: 'Écharpe Azbi Royale',
    labelEn: 'Royal Azbi Scarf',
    sublabelAr: 'شال موريتاني أصيل',
    sublabelFr: 'Chèche mauritanien authentique',
    sublabelEn: 'Authentic Mauritanian sash',
    priceRatio: 0.35,
  },
  {
    id: 3,
    slotKey: 'shoes',
    top: '84%',
    left: '64%',
    labelAr: 'حذاء جلدي تقليدي',
    labelFr: 'Souliers en Cuir Fait Main',
    labelEn: 'Handcrafted Leather Slippers',
    sublabelAr: 'جلد طبيعي ناعم ومريح',
    sublabelFr: 'Cuir véritable de Mauritanie',
    sublabelEn: 'Genuine artisan leather',
    priceRatio: 0.3,
  },
]

interface ModelFigureProps {
  product: Product
  animated: boolean
  activePinId: number
  onSelectPin: (id: number) => void
  onInspect: () => void
}

/**
 * 2026 Studio Model Figure with Hotspot Pins:
 * - Natural unclipped standing figure on the studio floor
 * - Interactive numbered pins (1, 2, 3) with pulsing gold rings
 * - Smooth hover scale and contact drop shadow
 */
function ModelFigure({
  product,
  animated,
  activePinId,
  onSelectPin,
  onInspect,
}: ModelFigureProps) {
  const { locale } = useApp()
  const image = primaryImage(product)
  const cleanImgUrl = ensureTransparentUrl(image?.url)
  const name = pickText(product.name, locale)

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-end select-none">
      {/* ── GARMENT / MODEL PHOTO ── */}
      <div className="relative w-full h-[320px] sm:h-[400px] flex items-center justify-center">
        {cleanImgUrl ? (
          <img
            src={cleanImgUrl}
            alt={name}
            loading="lazy"
            draggable={false}
            className="h-full w-auto max-w-full object-contain object-bottom filter drop-shadow-[0_20px_28px_rgba(0,0,0,0.30)] dark:drop-shadow-[0_24px_36px_rgba(0,0,0,0.95)] pointer-events-none transition-transform duration-300"
          />
        ) : (
          <div className="flex h-56 w-44 items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold/5">
            <span className="font-display text-4xl text-gold/40">{name.charAt(0)}</span>
          </div>
        )}

        {/* ── NUMBERED INTERACTIVE HOTSPOT PINS (1, 2, 3) ── */}
        {LOOK_PINS.map((pin) => {
          const isActive = pin.id === activePinId
          return (
            <button
              key={pin.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSelectPin(pin.id)
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                onInspect()
              }}
              aria-label={`Hotspot pin ${pin.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
              style={{ top: pin.top, left: pin.left }}
            >
              <span className="relative flex h-8 w-8 items-center justify-center">
                {animated && (
                  <motion.span
                    className={`absolute inset-0 rounded-full border ${
                      isActive ? 'border-gold shadow-[0_0_12px_rgba(201,154,82,0.8)]' : 'border-white/80'
                    }`}
                    animate={{ scale: [1, 1.85], opacity: [0.8, 0] }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: 'easeOut',
                      delay: pin.id * 0.4,
                    }}
                  />
                )}
                <span
                  className={`relative flex h-6 w-6 items-center justify-center rounded-full font-mono text-[11px] font-bold shadow-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-gold via-gold-light to-gold text-ink ring-2 ring-gold/60 scale-125 shadow-[0_0_14px_rgba(201,154,82,0.7)]'
                      : 'bg-black/85 text-cream-card border border-white/50 group-hover:bg-gold group-hover:text-ink group-hover:scale-110'
                  }`}
                >
                  {pin.id}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Realistic Floor Contact Shadow */}
      <div
        aria-hidden="true"
        className="w-48 sm:w-60 h-4 mt-1 rounded-[50%] bg-black/25 dark:bg-black/60 blur-md pointer-events-none"
      />
    </div>
  )
}

/**
 * 2026 "Try the Look" Interactive Mannequin Scene (Videodaki Birebir Deneyim):
 * - Clean studio backdrop with model lineup (center active, left/right flanking looks)
 * - 3 Numbered garment pins (1: Main Garment, 2: Accessory/Sash, 3: Footwear)
 * - Coordinated 3-piece product breakdown cards with instant individual `+` add buttons
 * - Master "Add full look" button with 10% instant package discount
 * - Fluid keyboard, swipe & arrow navigation
 */
export function MannequinScene({ products, intensity }: SceneProps) {
  const { t, locale } = useApp()
  const { add } = useCart()
  const { luxury: toastLuxury } = useToast()
  const rtl = LOCALE_DIRECTION[locale] === 'rtl'
  const animated = intensity !== 'low'
  const tiltEnabled = intensity === 'high'

  const [index, setIndex] = useState(0)
  const [activePinId, setActivePinId] = useState(1)
  const [detailModalProduct, setDetailModalProduct] = useState<Product | null>(null)

  const product = products[Math.min(index, products.length - 1)]
  const prevProduct = products.length > 1 ? products[(index - 1 + products.length) % products.length] : null
  const nextProduct = products.length > 1 ? products[(index + 1) % products.length] : null

  const stageRef = useRef<HTMLDivElement>(null)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [5, -5]), {
    stiffness: 120,
    damping: 18,
  })
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-7, 7]), {
    stiffness: 120,
    damping: 18,
  })

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => {
        const next = current + delta
        if (next < 0) return products.length - 1
        if (next >= products.length) return 0
        return next
      })
    },
    [products.length],
  )

  const onDragEnd = (_event: unknown, info: PanInfo) => {
    const threshold = 40
    const dx = rtl ? -info.offset.x : info.offset.x
    if (dx <= -threshold) go(1)
    else if (dx >= threshold) go(-1)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled) return
    const rect = stageRef.current?.getBoundingClientRect()
    if (!rect) return
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
  }

  const resetTilt = () => {
    pointerX.set(0)
    pointerY.set(0)
  }

  // 3-Piece Look Pricing Calculations
  const basePrice = product.price
  const piece1Price = basePrice
  const piece2Price = Math.round(basePrice * 0.35)
  const piece3Price = Math.round(basePrice * 0.3)
  const fullLookRawTotal = piece1Price + piece2Price + piece3Price
  const fullLookDiscounted = Math.round(fullLookRawTotal * 0.9) // 10% Bundle Discount

  // Helper to add individual piece to cart
  function handleAddPiece(pinId: number) {
    const pin = LOOK_PINS.find((p) => p.id === pinId) || LOOK_PINS[0]
    const piecePrice =
      pin.id === 1 ? piece1Price : pin.id === 2 ? piece2Price : piece3Price

    const pieceTitle =
      locale === 'ar' ? pin.labelAr : locale === 'fr' ? pin.labelFr : pin.labelEn

    add(
      {
        productId: `${product._id}-piece-${pin.id}`,
        slug: product.slug,
        name: {
          ar: `${pickText(product.name, 'ar')} - ${pin.labelAr}`,
          fr: `${pickText(product.name, 'fr')} - ${pin.labelFr}`,
          en: `${pickText(product.name, 'en')} - ${pin.labelEn}`,
        },
        price: piecePrice,
        currency: product.currency,
        image: product.images[0]?.url,
        size: product.sizes[0],
      },
      1,
    )

    toastLuxury(
      locale === 'ar' ? 'تمت إضافة القطعة إلى السلة' : locale === 'fr' ? 'Pièce ajoutée au panier' : 'Piece added to cart',
      `${pieceTitle} • ${formatPrice(piecePrice, product.currency)}`,
      3500,
    )
  }

  // Add Full Look bundle to cart in one tap
  function handleAddFullLook() {
    add(
      {
        productId: `${product._id}-full-look`,
        slug: product.slug,
        name: {
          ar: `${pickText(product.name, 'ar')} (طقم الإطلالة الكاملة 3 قطع)`,
          fr: `${pickText(product.name, 'fr')} (Look Complet 3 Pièces)`,
          en: `${pickText(product.name, 'en')} (Full Look 3-Piece Bundle)`,
        },
        price: fullLookDiscounted,
        currency: product.currency,
        image: product.images[0]?.url,
        size: product.sizes[0],
      },
      1,
    )

    toastLuxury(
      locale === 'ar' ? 'تمت إضافة الإطلالة الكاملة مع خصم 10%!' : locale === 'fr' ? 'Look complet ajouté avec -10% !' : 'Full look bundle added with 10% off!',
      `${pickText(product.name, locale)} • ${formatPrice(fullLookDiscounted, product.currency)}`,
      4500,
    )
  }

  return (
    <section className="relative w-full overflow-hidden py-12 sm:py-16">
      {/* ── 1. HEADER SECTION (Try the Look) ── */}
      <div className="text-center space-y-2 mb-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 font-sans text-xs uppercase tracking-[0.25em] text-gold-dark dark:text-gold-light">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          {t('look.title')}
        </span>
        <h2 className="font-display text-2xl sm:text-4xl text-ink font-semibold tracking-tight">
          {pickText(product.name, locale)}
        </h2>
        <p className="font-sans text-xs sm:text-sm text-ink/70 max-w-lg mx-auto">
          {t('look.subtitle')}
        </p>
      </div>

      {/* ── 2. STUDIO STAGE WITH MODEL LINEUP (Previous, Active, Next) ── */}
      <div
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
        className="relative overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_25%,#f5eee1,#e0d2b8_68%,#c4b18f)] dark:bg-[radial-gradient(ellipse_at_50%_25%,#2b2116,#17120a_68%,#0a0805)] border border-line/50 shadow-xl px-4 pb-8 pt-8"
      >
        {/* Soft overhead spotlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[75%] w-[85%] -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(255,250,240,0.7),transparent)] blur-[4px] [clip-path:polygon(50%_0,100%_100%,0_100%)] dark:bg-[linear-gradient(to_bottom,rgba(255,236,190,0.15),transparent)]"
        />

        {/* ── MODEL LINEUP ── */}
        <div className="relative mx-auto flex items-center justify-center min-h-[360px] sm:min-h-[440px]">
          {/* Previous Flanking Model */}
          {prevProduct && (
            <button
              type="button"
              onClick={() => go(-1)}
              className="group absolute start-2 sm:start-10 z-10 hidden sm:flex flex-col items-center opacity-40 hover:opacity-90 transition-all duration-300 scale-75 hover:scale-80 cursor-pointer"
              style={{ transform: 'perspective(900px) rotateY(18deg)' }}
              title={pickText(prevProduct.name, locale)}
            >
              <div className="h-64 sm:h-80 w-44 opacity-80 pointer-events-none">
                <ModelFigure
                  product={prevProduct}
                  animated={false}
                  activePinId={0}
                  onSelectPin={() => go(-1)}
                  onInspect={() => go(-1)}
                />
              </div>
              <span className="font-sans text-[11px] text-ink/70 group-hover:text-gold mt-1 flex items-center gap-1 font-semibold">
                <span className="rtl:rotate-180">←</span> {pickText(prevProduct.name, locale)}
              </span>
            </button>
          )}

          {/* Center Active Model */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.14}
            onDragEnd={onDragEnd}
            className="relative z-20 h-[340px] w-[240px] cursor-grab touch-pan-y active:cursor-grabbing sm:h-[430px] sm:w-[310px]"
          >
            <motion.div
              className="h-full w-full"
              style={{ transformOrigin: 'bottom center' }}
              animate={animated ? { y: [0, -5, 0] } : undefined}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <motion.div
                className="h-full w-full"
                style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={product._id}
                    className="h-full w-full"
                    style={{ transformPerspective: 800 }}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.4, ease: TURN_EASE }}
                  >
                    <ModelFigure
                      product={product}
                      animated={animated}
                      activePinId={activePinId}
                      onSelectPin={setActivePinId}
                      onInspect={() => setDetailModalProduct(product)}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Next Flanking Model */}
          {nextProduct && (
            <button
              type="button"
              onClick={() => go(1)}
              className="group absolute end-2 sm:end-10 z-10 hidden sm:flex flex-col items-center opacity-40 hover:opacity-90 transition-all duration-300 scale-75 hover:scale-80 cursor-pointer"
              style={{ transform: 'perspective(900px) rotateY(-18deg)' }}
              title={pickText(nextProduct.name, locale)}
            >
              <div className="h-64 sm:h-80 w-44 opacity-80 pointer-events-none">
                <ModelFigure
                  product={nextProduct}
                  animated={false}
                  activePinId={0}
                  onSelectPin={() => go(1)}
                  onInspect={() => go(1)}
                />
              </div>
              <span className="font-sans text-[11px] text-ink/70 group-hover:text-gold mt-1 flex items-center gap-1 font-semibold">
                {pickText(nextProduct.name, locale)} <span className="rtl:rotate-180">→</span>
              </span>
            </button>
          )}
        </div>

        {/* ── MINIMALIST PROGRESS INDICATOR (Scroll / Swipe ile geçiş) ── */}
        <div className="mt-4 flex items-center justify-center max-w-xs mx-auto px-4 z-20 relative">
          {/* Sleek horizontal progress line with active segment */}
          <div className="w-48 h-1 rounded-full bg-gold/20 overflow-hidden relative">
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={false}
              animate={{
                width: `${100 / Math.max(1, products.length)}%`,
                left: `${(index * 100) / Math.max(1, products.length)}%`,
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ position: 'absolute' }}
            />
          </div>
        </div>

        {/* Subtle helper instruction */}
        <p className="text-center font-sans text-[11px] text-ink/55 mt-2 uppercase tracking-wider">
          • DOT TO SHOP THE PIECE •
        </p>
      </div>

      {/* ── 3. COORDINATED 3-PIECE BREAKDOWN & "ADD FULL LOOK" (Videodaki Birebir Kart Düzeni) ── */}
      <div className="mt-6 mx-auto max-w-2xl rounded-2xl border border-gold/30 bg-cream-card/90 dark:bg-black/50 p-4 sm:p-6 backdrop-blur-md shadow-lg">
        {/* Look Breakdown Header */}
        <div className="flex items-center justify-between border-b border-line/60 pb-3">
          <div>
            <span className="font-display text-lg font-bold text-ink">
              {pickText(product.name, locale)}
            </span>
            <p className="font-sans text-xs text-ink/60 mt-0.5">
              1 {LOOK_PINS[0].labelEn} + 1 {LOOK_PINS[1].labelEn} + 1 {LOOK_PINS[2].labelEn}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 font-sans text-xs font-bold text-gold-dark dark:text-gold-light">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            3 {t('look.piecesCount')}
          </span>
        </div>

        {/* ── 3 COORDINATED PIECE CARDS WITH THUMBNAIL & QUICK ADD (+) ── */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LOOK_PINS.map((pin) => {
            const isSelected = pin.id === activePinId
            const piecePrice =
              pin.id === 1 ? piece1Price : pin.id === 2 ? piece2Price : piece3Price
            const pinTitle =
              locale === 'ar' ? pin.labelAr : locale === 'fr' ? pin.labelFr : pin.labelEn
            const pinSub =
              locale === 'ar' ? pin.sublabelAr : locale === 'fr' ? pin.sublabelFr : pin.sublabelEn

            return (
              <div
                key={pin.id}
                onClick={() => setActivePinId(pin.id)}
                className={`group relative flex items-center sm:flex-col sm:items-start rounded-xl p-3 border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-gold bg-gold/10 ring-1 ring-gold/40 shadow-sm'
                    : 'border-line/60 bg-cream/30 hover:border-gold/40 hover:bg-gold/5'
                }`}
              >
                {/* Pin number tag */}
                <span className="absolute top-2 start-2 font-mono text-[10px] font-bold w-5 h-5 rounded-full bg-gold/20 text-gold flex items-center justify-center border border-gold/40">
                  {pin.id}
                </span>

                {/* Thumbnail */}
                <div className="w-14 h-14 sm:w-full sm:h-24 rounded-lg bg-cream-card/60 dark:bg-black/30 flex items-center justify-center overflow-hidden shrink-0 mt-3 sm:mt-4">
                  {product.images[0]?.url ? (
                    <img
                      src={ensureTransparentUrl(product.images[0]?.url)}
                      alt={pinTitle}
                      className="h-full w-full object-contain p-1 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <span className="font-display text-lg text-gold/40">{pin.id}</span>
                  )}
                </div>

                {/* Details */}
                <div className="ms-3 sm:ms-0 mt-0 sm:mt-2.5 flex-1 min-w-0">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-gold-dark font-bold block">
                    CLASSY MEN
                  </span>
                  <p className="font-sans text-xs font-bold text-ink truncate">
                    {pinTitle}
                  </p>
                  <p className="font-sans text-[11px] text-ink/55 truncate">
                    {pinSub}
                  </p>
                  <p className="font-mono text-xs font-bold text-gold mt-1">
                    {formatPrice(piecePrice, product.currency)}
                  </p>
                </div>

                {/* Instant Single Piece Add Button (+) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddPiece(pin.id)
                  }}
                  title={`Add ${pinTitle}`}
                  className="sm:absolute sm:bottom-2.5 sm:end-2.5 w-7 h-7 rounded-full border border-gold/40 bg-gold/15 text-gold hover:bg-gold hover:text-ink flex items-center justify-center text-sm font-bold transition-all shrink-0 ms-2"
                >
                  +
                </button>
              </div>
            )
          })}
        </div>

        {/* ── MASTER "ADD FULL LOOK" CTA (10% BUNDLE DISCOUNT) ── */}
        <div className="mt-5 pt-4 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-start">
            <span className="font-sans text-xs uppercase tracking-wider text-ink/50 line-through me-2">
              {formatPrice(fullLookRawTotal, product.currency)}
            </span>
            <span className="font-display text-2xl font-bold text-gold">
              {formatPrice(fullLookDiscounted, product.currency)}
            </span>
            <span className="ms-2.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 font-sans text-[11px] font-bold px-2 py-0.5">
              {t('look.bundleDiscount')}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddFullLook}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-brand bg-gradient-to-r from-gold via-gold-light to-gold px-8 py-3 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-bold text-ink shadow-[0_4px_20px_rgba(201,154,82,0.4)] hover:shadow-[0_6px_26px_rgba(201,154,82,0.55)] transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-4 h-4 text-ink shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>{t('look.addFullLook')}</span>
          </button>
        </div>

        {/* Active Pin Focus Bar */}
        <div className="mt-3 pt-2.5 border-t border-line/40 flex items-center justify-between text-xs font-sans text-ink/70">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gold animate-pulse" />
            <span className="font-semibold">
              {locale === 'ar'
                ? LOOK_PINS[activePinId - 1].labelAr
                : locale === 'fr'
                ? LOOK_PINS[activePinId - 1].labelFr
                : LOOK_PINS[activePinId - 1].labelEn}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setDetailModalProduct(product)}
            className="text-gold font-bold hover:underline"
          >
            {t('product.details')} →
          </button>
        </div>
      </div>

      {/* Full Detail Modal */}
      <AnimatePresence>
        {detailModalProduct && (
          <SceneDetailCard
            product={detailModalProduct}
            onClose={() => setDetailModalProduct(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
