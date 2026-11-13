import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LOCALE_DIRECTION } from '@shared/constants/locales'
import { useApp } from '../app/useApp'
import { formatPrice } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

/** Ensures Cloudinary images have white backgrounds stripped and empty transparent padding auto-trimmed. */
function ensureTransparentUrl(url?: string): string {
  if (!url) return ''
  if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
    let clean = url.replace(/\.(jpg|jpeg)$/i, '.png')
    if (!clean.includes('e_make_transparent')) {
      clean = clean.replace('/image/upload/', '/image/upload/e_make_transparent:35,e_trim,f_png/')
    }
    return clean
  }
  return url
}

/** Detects if a product is pants/jeans/trousers to use an authentic trouser clamp hanger. */
function isBottoms(product: Product): boolean {
  const text = `${product.name?.ar || ''} ${product.name?.fr || ''} ${product.name?.en || ''} ${product.category?.slug || ''} ${product.slug || ''} ${(product.tags || []).join(' ')}`.toLowerCase()
  return (
    text.includes('jean') ||
    text.includes('pant') ||
    text.includes('trouser') ||
    text.includes('جينز') ||
    text.includes('بنطال') ||
    text.includes('بنطلون') ||
    text.includes('سروال')
  )
}

/**
 * Height of the 3D curved rail at normalized position u in [0, 1].
 * Matches the SVG quadratic curve: M 0 20 Q 500 84 1000 20 (base = 20, center dip = 52).
 */
function getRailY(u: number): number {
  const yBase = 20
  const dip = 32 // at center u=0.5: 20 + 4*32*0.25 = 52px
  return yBase + 4 * dip * u * (1 - u)
}

interface RailGarmentProps {
  product: Product
  offset: number // -2, -1, 0 (active center), 1, 2
  isRtl: boolean
  onSelect: () => void
  onOpen: (product: Product) => void
}

/**
 * 2026 Boutique Garment Hanging on 3D Perspective Rail:
 * - Bespoke hanger for tops (contoured collar hanger) vs bottoms (trouser clamp with brass clips).
 * - Zero gap: garment collar/waistband snugly meets the hanger with natural boutique fit.
 * - Anchored at the exact mathematical coordinate of the rail bar (zero detachment).
 * - Rotated inward in 3D profile when flanking, facing forward when active.
 * - Suspended boutique price tag with fine thread.
 * - Smooth 180° flip on tap for front/back view inspection.
 */
function RailGarment({ product, offset, isRtl, onSelect, onOpen }: RailGarmentProps) {
  const { t, locale } = useApp()
  const name = pickText(product.name, locale)
  const [isFlipped, setIsFlipped] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const tapTimer = useRef<number | null>(null)
  const isPants = isBottoms(product)

  const isActive = offset === 0
  const isDirectFlank = Math.abs(offset) === 1

  // Map discrete slot offset to normalized rail coordinate u in [0, 1]
  let u = 0.5
  if (offset === -1) u = isRtl ? 0.74 : 0.26
  else if (offset === 1) u = isRtl ? 0.26 : 0.74
  else if (offset === -2) u = isRtl ? 0.92 : 0.08
  else if (offset === 2) u = isRtl ? 0.08 : 0.92

  // Rail height at this exact horizontal position
  const railY = getRailY(u)

  // 3D perspective rotation: Flanking items face inward toward center focus
  const dirMultiplier = isRtl ? -1 : 1
  const rotY = offset * -22 * dirMultiplier
  const zPos = isActive ? 50 : isDirectFlank ? -40 : -110
  const scale = isActive ? 1.0 : isDirectFlank ? 0.82 : 0.68
  const opacity = isActive ? 1.0 : isDirectFlank ? 0.75 : 0.4

  const frontImage = ensureTransparentUrl(product.images[0]?.url)
  const backImage = ensureTransparentUrl(product.images[1]?.url || product.images[0]?.url)
  const hasMultipleImages = product.images.length > 1

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isActive) {
      onSelect()
      return
    }

    setTapCount((prev) => prev + 1)
    if (tapTimer.current) window.clearTimeout(tapTimer.current)

    tapTimer.current = window.setTimeout(() => {
      if (tapCount >= 1) {
        onOpen(product)
      } else {
        if (hasMultipleImages) {
          setIsFlipped((prev) => !prev)
        } else {
          onOpen(product)
        }
      }
      setTapCount(0)
    }, 240)
  }

  return (
    <motion.div
      onClick={handleClick}
      animate={{
        left: `${u * 100}%`,
        top: `${railY}px`,
        z: zPos,
        scale,
        opacity,
        rotateY: rotY,
      }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      style={{
        position: 'absolute',
        transform: 'translateX(-50%)',
        transformOrigin: '50% 0px', // Scaling and rotating anchors firmly at the hook apex on the rail!
        transformStyle: 'preserve-3d',
        zIndex: 50 - Math.abs(offset) * 10,
      }}
      className="group flex flex-col items-center select-none cursor-pointer w-60 sm:w-72"
    >
      {/* ── 1. AUTHENTIC BOUTIQUE HANGER ── */}
      <div className="relative flex flex-col items-center pointer-events-none -mt-3.5 z-30">
        {isPants ? (
          /* ── TROUSER / JEANS HANGER: Sleek Brass Bar + Two Luxury Clamp Clips ── */
          <svg
            className="w-48 sm:w-56 h-14 text-[#d4af37] filter drop-shadow-[0_3px_5px_rgba(0,0,0,0.35)] overflow-visible"
            viewBox="0 0 200 52"
            fill="none"
          >
            {/* Brass Hook Wire looping over the rail line */}
            <path
              d="M 100 24 L 100 11 C 100 3 108 0 110 4 C 112 8 106 13 100 13"
              stroke="url(#railHookBrassGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Swivel collar bolt at base */}
            <ellipse cx="100" cy="24" rx="4" ry="2" fill="url(#railHookBrassGrad)" stroke="#7a5413" strokeWidth="0.8" />

            {/* Horizontal Trouser Bar */}
            <rect
              x="20"
              y="23"
              width="160"
              height="4"
              rx="2"
              fill="url(#trouserBarGrad)"
              stroke="#68471b"
              strokeWidth="0.8"
            />

            {/* Left Luxury Brass Clamp Clip */}
            <g transform="translate(48, 23)">
              {/* Clamp swivel collar */}
              <rect x="-3.5" y="0" width="7" height="4" rx="1" fill="#7a5413" />
              {/* Clamp metal body */}
              <rect
                x="-4"
                y="4"
                width="8"
                height="16"
                rx="1.5"
                fill="url(#railHookBrassGrad)"
                stroke="#68471b"
                strokeWidth="0.8"
              />
              {/* Clamp spring coil accent */}
              <circle cx="0" cy="10" r="1.8" fill="#fff3bf" stroke="#7a5413" strokeWidth="0.6" />
              {/* Clamp rubber/felt grip jaws holding waistband */}
              <rect x="-5" y="18" width="10" height="7" rx="1.5" fill="#2d1c0e" stroke="#68471b" strokeWidth="0.6" />
            </g>

            {/* Right Luxury Brass Clamp Clip */}
            <g transform="translate(152, 23)">
              {/* Clamp swivel collar */}
              <rect x="-3.5" y="0" width="7" height="4" rx="1" fill="#7a5413" />
              {/* Clamp metal body */}
              <rect
                x="-4"
                y="4"
                width="8"
                height="16"
                rx="1.5"
                fill="url(#railHookBrassGrad)"
                stroke="#68471b"
                strokeWidth="0.8"
              />
              {/* Clamp spring coil accent */}
              <circle cx="0" cy="10" r="1.8" fill="#fff3bf" stroke="#7a5413" strokeWidth="0.6" />
              {/* Clamp rubber/felt grip jaws holding waistband */}
              <rect x="-5" y="18" width="10" height="7" rx="1.5" fill="#2d1c0e" stroke="#68471b" strokeWidth="0.6" />
            </g>

            <defs>
              <linearGradient id="railHookBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3bf" />
                <stop offset="45%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#7a5413" />
              </linearGradient>
              <linearGradient id="trouserBarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3d2915" />
                <stop offset="25%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#fff3bf" />
                <stop offset="75%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#3d2915" />
              </linearGradient>
            </defs>
          </svg>
        ) : (
          /* ── TOP GARMENT (Shirt/Polo/Jacket): Hidden internal hanger, ONLY the brass hook emerges from the collar opening ── */
          <svg
            className="w-8 h-10 text-[#d4af37] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] overflow-visible"
            viewBox="0 0 32 40"
            fill="none"
          >
            {/* Brass Hook Wire looping over the rail line */}
            <path
              d="M 16 32 L 16 12 C 16 3 24 0 26 5 C 28 10 22 15 16 15"
              stroke="url(#railHookBrassGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Swivel collar bolt entering the neck opening */}
            <ellipse cx="16" cy="32" rx="3.5" ry="1.8" fill="url(#railHookBrassGrad)" stroke="#7a5413" strokeWidth="0.8" />
            <defs>
              <linearGradient id="railHookBrassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff3bf" />
                <stop offset="45%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#7a5413" />
              </linearGradient>
            </defs>
          </svg>
        )}
      </div>

      {/* ── 2. BOUTIQUE DANGLING PRICE TAG (Thread + Tag) ── */}
      <div
        className={`absolute z-40 pointer-events-none ${
          isPants ? 'top-8 start-6 sm:start-8' : 'top-6 start-8 sm:start-12'
        }`}
      >
        {/* Fine gold suspended thread */}
        <div className="w-px h-6 bg-gold/70 mx-auto" />
        {/* Hanging boutique tag */}
        <div className="rounded-[3px] border border-[#d6c7b2] bg-[#fbf9f4] dark:bg-[#181512] dark:border-gold/40 px-2.5 py-0.5 shadow-md flex flex-col items-center">
          <div className="w-1.5 h-1.5 rounded-full border border-gold/70 bg-gold/20 mb-0.5" />
          <span className="font-mono text-[10px] font-bold text-ink dark:text-gold tracking-tight whitespace-nowrap">
            {formatPrice(product.price, product.currency)}
          </span>
        </div>
      </div>

      {/* ── 3. GARMENT BODY (Snugly Attached to Hanger Base) ── */}
      <div
        className={`relative w-full h-[320px] sm:h-[390px] z-20 [perspective:1000px] ${
          isPants ? '-mt-6 sm:-mt-7' : '-mt-2 sm:-mt-2.5'
        }`}
      >
        <motion.div
          animate={{ rotateY: isFlipped && isActive ? 180 : 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative w-full h-full flex flex-col items-center justify-start transition-transform duration-300 group-hover:-translate-y-1.5"
        >
          {/* Front Face */}
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 flex flex-col items-center justify-start"
          >
            {frontImage ? (
              <img
                src={frontImage}
                alt={name}
                loading="lazy"
                draggable={false}
                className="h-full w-auto max-w-full object-contain object-top filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_24px_36px_rgba(0,0,0,0.85)] pointer-events-none transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <div className="flex h-48 w-40 items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold/5">
                <span className="font-display text-4xl text-gold/40">{name.charAt(0)}</span>
              </div>
            )}

            {/* Flip hint pill on hover */}
            {hasMultipleImages && isActive && (
              <span className="absolute bottom-2 rounded-full border border-gold/30 bg-black/60 px-2.5 py-0.5 font-sans text-[9px] uppercase tracking-wider text-gold-light opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs flex items-center gap-1">
                <svg className="w-2.5 h-2.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('admin.dragToRotate') ? 'Flip 180°' : 'Flip'}
              </span>
            )}
          </div>

          {/* Back Face */}
          <div
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
            className="absolute inset-0 flex flex-col items-center justify-start"
          >
            {backImage ? (
              <img
                src={backImage}
                alt={`${name} back`}
                loading="lazy"
                draggable={false}
                className="h-full w-auto max-w-full object-contain object-top filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.22)] dark:drop-shadow-[0_24px_36px_rgba(0,0,0,0.85)] pointer-events-none"
              />
            ) : (
              <div className="flex h-48 w-40 items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold/5">
                <span className="font-display text-4xl text-gold/40">{name.charAt(0)}</span>
              </div>
            )}
            <span className="absolute bottom-2 rounded-full border border-gold/40 bg-black/70 px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider text-gold-light">
              Back View
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── 4. PRODUCT TITLE & DETAILS ── */}
      <div className="mt-3 text-center w-full px-2">
        <p className={`font-display font-semibold transition-colors line-clamp-1 ${
          isActive ? 'text-lg sm:text-xl text-ink group-hover:text-gold' : 'text-sm text-ink/60'
        }`}>
          {name}
        </p>
        {isActive && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpen(product)
            }}
            className="mt-1 inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-[0.18em] text-gold hover:underline font-bold"
          >
            {t('product.details')} →
          </button>
        )}
      </div>

      {/* ── 5. FLOOR CONTACT SHADOW ── */}
      <div
        aria-hidden="true"
        className={`mt-2 rounded-[50%] bg-black/15 dark:bg-black/60 blur-md pointer-events-none transition-all duration-300 ${
          isActive ? 'w-44 sm:w-56 h-4 opacity-100' : 'w-32 sm:w-40 h-3 opacity-60'
        }`}
      />
    </motion.div>
  )
}

/**
 * 2026 Interactive Curved Clothes Rail (Video Aligned):
 * - Seamless metallic rail bar curving in 3D perspective toward the user.
 * - Clothes hang securely with brass hooks clamped onto the rail at all times.
 * - Bespoke hangers: tops have contoured collar shoulders, bottoms have luxury trouser clamp clips.
 * - Drag, swipe, trackpad/wheel, or click to glide garments smoothly along the rail curve.
 * - Video-exact atmospheric footer with instruction pill & minimal progress slider.
 */
export function RailScene({ products }: SceneProps) {
  const { t, locale } = useApp()
  const isRtl = LOCALE_DIRECTION[locale] === 'rtl'
  const [activeIdx, setActiveIdx] = useState(0)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const lastWheelTime = useRef(0)

  if (products.length === 0) return null

  const hasMultiple = products.length > 1

  function handleNext() {
    if (!hasMultiple) return
    setActiveIdx((prev) => (prev + 1) % products.length)
  }

  function handlePrev() {
    if (!hasMultiple) return
    setActiveIdx((prev) => (prev - 1 + products.length) % products.length)
  }

  // Smooth mouse wheel / trackpad swipe
  function handleWheel(e: React.WheelEvent) {
    if (!hasMultiple) return
    const now = Date.now()
    if (now - lastWheelTime.current < 320) return
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (Math.abs(delta) > 20) {
      lastWheelTime.current = now
      const goNext = isRtl ? delta < 0 : delta > 0
      if (goNext) handleNext()
      else handlePrev()
    }
  }

  return (
    <section className="relative w-full overflow-hidden py-10 sm:py-14 select-none">
      {/* ── TOP BADGE & EYEBROW ── */}
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 font-sans text-xs uppercase tracking-[0.25em] text-gold-dark dark:text-gold-light">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          {t('rail.badge')}
        </span>
      </div>

      <div className="relative pt-2">
        {/* Soft radial room lighting */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-6 top-4 h-48 rounded-[50%] bg-gold/5 blur-3xl dark:bg-gold/10"
        />

        {/* ── 3D HORSESHOE SUSPENDED RAIL BAR (Curving toward user in center) ── */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-20 z-20 flex items-center overflow-visible"
        >
          <svg className="w-full h-20 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 80">
            {/* Ceiling Suspension Wires */}
            <g stroke="url(#suspensionWireGrad)" strokeWidth="1.2" opacity="0.65">
              {/* Left ceiling cable */}
              <line x1="220" y1="-80" x2="220" y2="38" />
              {/* Left bracket collar */}
              <circle cx="220" cy="38" r="3.5" fill="#d4af37" stroke="#63451b" strokeWidth="0.8" />
              {/* Right ceiling cable */}
              <line x1="780" y1="-80" x2="780" y2="38" />
              {/* Right bracket collar */}
              <circle cx="780" cy="38" r="3.5" fill="#d4af37" stroke="#63451b" strokeWidth="0.8" />
            </g>

            {/* Cast shadow behind the rail */}
            <path
              d="M 0 24 Q 500 88 1000 24"
              fill="none"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="7"
              filter="blur(4px)"
            />

            {/* Metallic core gradient bar curving down/forward toward user (M 0 20 Q 500 84 1000 20) */}
            <path
              d="M 0 20 Q 500 84 1000 20"
              fill="none"
              stroke="url(#railMetallicHorseshoeGrad)"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Specular glossy highlight along top curve */}
            <path
              d="M 0 18.5 Q 500 82.5 1000 18.5"
              fill="none"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="1.2"
            />

            <defs>
              <linearGradient id="suspensionWireGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#8a6314" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.9" />
              </linearGradient>

              <linearGradient id="railMetallicHorseshoeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#63451b" />
                <stop offset="25%" stopColor="#d4af37" />
                <stop offset="50%" stopColor="#fff4c2" />
                <stop offset="75%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#63451b" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* ── 3D RAIL CAROUSEL STAGE (Drag / Wheel / Swipe to glide along rail) ── */}
        <motion.div
          onWheel={handleWheel}
          drag={hasMultiple ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const THRESHOLD = 40
            const dx = info.offset.x
            const vx = info.velocity.x
            const goNext = isRtl ? dx > THRESHOLD || vx > 300 : dx < -THRESHOLD || vx < -300
            const goPrev = isRtl ? dx < -THRESHOLD || vx < -300 : dx > THRESHOLD || vx > 300
            if (goNext) handleNext()
            else if (goPrev) handlePrev()
          }}
          style={{ perspective: 1200 }}
          className="relative w-full max-w-5xl mx-auto min-h-[500px] sm:min-h-[580px] cursor-grab active:cursor-grabbing px-4 overflow-hidden"
        >
          {products.map((item, idx) => {
            // Calculate wrapped circular distance/offset relative to activeIdx (-2, -1, 0, 1, 2)
            let offset = idx - activeIdx
            if (products.length > 2) {
              if (offset > products.length / 2) offset -= products.length
              if (offset < -products.length / 2) offset += products.length
            }

            // Only render items within ±2 steps of center to keep stage clean & high-performance
            if (Math.abs(offset) > 2) return null

            return (
              <RailGarment
                key={item._id}
                product={item}
                offset={offset}
                isRtl={isRtl}
                onSelect={() => setActiveIdx(idx)}
                onOpen={(p) => setSelectedProduct(p)}
              />
            )
          })}
        </motion.div>

        {/* ── MINIMAL PROGRESS INDICATOR PILLS (Video Aligned) ── */}
        {hasMultiple && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {products.map((p, idx) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setActiveIdx(idx)}
                aria-label={`Product ${idx + 1}`}
                className={`transition-all rounded-full ${
                  idx === activeIdx
                    ? 'w-7 h-2 bg-gradient-to-r from-gold to-gold-light shadow-sm'
                    : 'w-2 h-2 bg-gold/30 hover:bg-gold/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── 2026 ATMOSPHERE FOOTER BAR (Videodaki gibi) ── */}
        <div className="mt-6 border-t border-line/60 pt-6 px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
            {/* Left instruction pill: "Tap a piece to turn it • tap again to look closer" */}
            <div className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 font-sans text-xs text-ink/70">
              <svg className="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>{t('rail.instruction')}</span>
            </div>

            {/* Right fabric note & button: "Crafted in heavyweight... • Shop the Collection →" */}
            <div className="flex items-center gap-4">
              <p className="hidden md:block font-sans text-xs text-ink/60 max-w-sm italic">
                {t('rail.fabricNote')}
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 rounded-brand bg-gold/15 border border-gold/40 px-4 py-2 font-sans text-xs uppercase tracking-[0.2em] font-bold text-gold-dark dark:text-gold-light hover:bg-gold hover:text-cream-card transition-all"
              >
                <span>{t('rail.shopCollection')}</span>
                <span className="rtl:rotate-180">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Detail Card Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <SceneDetailCard product={selectedProduct} onClose={() => setSelectedProduct(null)} />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
