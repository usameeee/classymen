import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { LOCALE_DIRECTION } from '@shared/constants/locales'
import { useApp } from '../app/useApp'
import { formatPrice } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

const DOOR_SPRING = { type: 'spring', stiffness: 50, damping: 14, mass: 1 } as const
const SNAP_SPRING = { type: 'spring', stiffness: 320, damping: 36 } as const

/** Ensures Cloudinary images have backgrounds stripped on the fly. */
function ensureTransparentUrl(url?: string): string {
  if (!url) return ''
  if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
    if (!url.includes('e_make_transparent')) {
      return url.replace('/image/upload/', '/image/upload/e_make_transparent:20,f_auto,q_auto/')
    }
  }
  return url
}

// ─────────────────────────────────────────────
// HANGING ROD COMPARTMENT (top)
// ─────────────────────────────────────────────
interface HangingCompartmentProps {
  products: Product[]
  onOpen: (product: Product) => void
}

function HangingCompartment({ products, onOpen }: HangingCompartmentProps) {
  const { locale } = useApp()
  const isRtl = LOCALE_DIRECTION[locale] === 'rtl'
  const [activeIdx, setActiveIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const hasMultiple = products.length > 1

  const prevIdx = (activeIdx - 1 + products.length) % products.length
  const nextIdx = (activeIdx + 1) % products.length
  const current = products[Math.min(activeIdx, products.length - 1)]
  const prevProduct = hasMultiple ? products[prevIdx] : null
  const nextProduct = hasMultiple ? products[nextIdx] : null

  function handlePrev() { setActiveIdx((i) => (i - 1 + products.length) % products.length); setIsFlipped(false) }
  function handleNext() { setActiveIdx((i) => (i + 1) % products.length); setIsFlipped(false) }

  useEffect(() => {
    if (!hasMultiple) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') isRtl ? handleNext() : handlePrev()
      else if (e.key === 'ArrowRight') isRtl ? handlePrev() : handleNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [hasMultiple, isRtl, products.length])

  const frontImage = ensureTransparentUrl(current.images[0]?.url)
  const backImage = ensureTransparentUrl(current.images[1]?.url || current.images[0]?.url)
  const name = pickText(current.name, locale)

  return (
    <div className="relative">
      {/* Brass Rod */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-5 z-20 flex items-center">
        <svg className="w-full h-5 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 20">
          <rect x="0" y="6" width="1000" height="8" fill="rgba(0,0,0,0.5)" rx="4" />
          <rect x="0" y="4" width="1000" height="7" fill="url(#wRod)" rx="3.5" />
          <rect x="0" y="4.5" width="1000" height="2" fill="rgba(255,255,255,0.35)" rx="1" />
          <rect x="0" y="1" width="10" height="16" fill="url(#wBracket)" rx="2" />
          <rect x="990" y="1" width="10" height="16" fill="url(#wBracket)" rx="2" />
          <defs>
            <linearGradient id="wRod" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#785928" />
              <stop offset="25%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#ffd875" />
              <stop offset="75%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#785928" />
            </linearGradient>
            <linearGradient id="wBracket" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8a6314" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#8a6314" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3-Piece Carousel */}
      <motion.div
        className="relative flex items-start justify-center gap-4 sm:gap-10 pt-5 pb-3 min-h-[340px] sm:min-h-[400px] cursor-grab active:cursor-grabbing select-none"
        drag={hasMultiple ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        dragMomentum={false}
        onDragEnd={(_, info) => {
          const THRESHOLD = 60
          const goNext = isRtl ? info.offset.x > THRESHOLD || info.velocity.x > 400 : info.offset.x < -THRESHOLD || info.velocity.x < -400
          const goPrev = isRtl ? info.offset.x < -THRESHOLD || info.velocity.x < -400 : info.offset.x > THRESHOLD || info.velocity.x > 400
          if (goNext) handleNext()
          else if (goPrev) handlePrev()
        }}
      >
        {/* Prev flanking piece */}
        {hasMultiple && prevProduct && (
          <motion.div
            onClick={isRtl ? handleNext : handlePrev}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isRtl ? handleNext() : handlePrev() } }}
            className="hidden sm:flex flex-col items-center cursor-pointer select-none w-32 sm:w-40 shrink-0 opacity-35 hover:opacity-70 transition-opacity duration-300"
            style={{ transform: isRtl ? 'scale(0.75) perspective(900px) rotateY(-16deg)' : 'scale(0.75) perspective(900px) rotateY(16deg)' }}
          >
            {/* Invisible hook stub */}
            <div className="h-10 w-6 opacity-0" aria-hidden="true" />
            <div className="w-full h-[200px] sm:h-[260px] -mt-5 z-20">
              {prevProduct.images[0]?.url ? (
                <img src={ensureTransparentUrl(prevProduct.images[0].url)} alt={pickText(prevProduct.name, locale)} loading="lazy" draggable={false} className="h-full w-auto max-w-full mx-auto object-contain object-top filter drop-shadow-[0_15px_22px_rgba(0,0,0,0.4)] pointer-events-none" />
              ) : (
                <div className="flex h-full items-center justify-center"><span className="font-display text-2xl text-gold/30">{pickText(prevProduct.name, locale).charAt(0)}</span></div>
              )}
            </div>
          </motion.div>
        )}

        {/* Active center piece */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current._id}
            initial={{ opacity: 0, scale: 0.9, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-30 flex flex-col items-center select-none w-52 sm:w-64 shrink-0"
          >
            <div
              onClick={() => { if (current.images.length > 1) { setIsFlipped((f) => !f) } else { onOpen(current) } }}
              className="group relative w-full cursor-pointer [perspective:1000px] flex flex-col items-center"
            >
              {/* Brass Hook — invisible (inside collar) */}
              <div className="relative z-30 flex flex-col items-center pointer-events-none opacity-0 h-10 w-6" aria-hidden="true" />

              {/* Price Tag */}
              <div className="absolute top-6 start-10 sm:start-12 z-40 pointer-events-none">
                <div className="w-px h-6 bg-amber-300/80 mx-auto" />
                <div className="rounded-[3px] border border-amber-700/50 bg-[#fdfbf7] dark:bg-[#1a1714] dark:border-gold/40 px-2.5 py-0.5 shadow-md flex flex-col items-center">
                  <div className="w-1 h-1 rounded-full border border-gold/60 bg-gold/20 mb-0.5" />
                  <span className="font-mono text-[10px] font-bold text-ink dark:text-gold tracking-tight whitespace-nowrap">
                    {formatPrice(current.price, current.currency)}
                  </span>
                </div>
              </div>

              {/* Garment Body */}
              <div className="relative w-full h-[260px] sm:h-[320px] -mt-4 z-20">
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="relative w-full h-full flex flex-col items-center justify-start group-hover:-translate-y-1.5 transition-transform duration-300"
                >
                  <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0 flex flex-col items-center justify-start">
                    {frontImage ? (
                      <img src={frontImage} alt={name} loading="lazy" draggable={false} className="h-full w-auto max-w-full object-contain object-top filter drop-shadow-[0_22px_32px_rgba(0,0,0,0.4)] pointer-events-none group-hover:scale-[1.03] transition-transform duration-300" />
                    ) : (
                      <div className="flex h-48 w-36 items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold/5">
                        <span className="font-display text-4xl text-gold/40">{name.charAt(0)}</span>
                      </div>
                    )}
                    {current.images.length > 1 && (
                      <span className="absolute bottom-1 rounded-full border border-gold/30 bg-black/60 px-2.5 py-0.5 font-sans text-[9px] uppercase tracking-wider text-gold-light opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">Flip 180°</span>
                    )}
                  </div>
                  <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 flex flex-col items-center justify-start">
                    {backImage ? (
                      <img src={backImage} alt={`${name} back`} loading="lazy" draggable={false} className="h-full w-auto max-w-full object-contain object-top filter drop-shadow-[0_22px_32px_rgba(0,0,0,0.4)] pointer-events-none" />
                    ) : (
                      <div className="flex h-48 w-36 items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold/5">
                        <span className="font-display text-4xl text-gold/40">{name.charAt(0)}</span>
                      </div>
                    )}
                    <span className="absolute bottom-1 rounded-full border border-gold/40 bg-black/70 px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider text-gold-light">Back View</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Name + CTA */}
            <div className="mt-2 text-center w-full px-2">
              <p className="font-display text-sm sm:text-base text-amber-100 font-semibold line-clamp-1">{name}</p>
              <button type="button" onClick={() => onOpen(current)} className="mt-0.5 inline-flex items-center gap-1 font-sans text-xs uppercase tracking-[0.15em] text-amber-400 hover:underline font-bold">Details →</button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next flanking piece */}
        {hasMultiple && nextProduct && (
          <motion.div
            onClick={isRtl ? handlePrev : handleNext}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); isRtl ? handlePrev() : handleNext() } }}
            className="hidden sm:flex flex-col items-center cursor-pointer select-none w-32 sm:w-40 shrink-0 opacity-35 hover:opacity-70 transition-opacity duration-300"
            style={{ transform: isRtl ? 'scale(0.75) perspective(900px) rotateY(16deg)' : 'scale(0.75) perspective(900px) rotateY(-16deg)' }}
          >
            <div className="h-10 w-6 opacity-0" aria-hidden="true" />
            <div className="w-full h-[200px] sm:h-[260px] -mt-5 z-20">
              {nextProduct.images[0]?.url ? (
                <img src={ensureTransparentUrl(nextProduct.images[0].url)} alt={pickText(nextProduct.name, locale)} loading="lazy" draggable={false} className="h-full w-auto max-w-full mx-auto object-contain object-top filter drop-shadow-[0_15px_22px_rgba(0,0,0,0.4)] pointer-events-none" />
              ) : (
                <div className="flex h-full items-center justify-center"><span className="font-display text-2xl text-gold/30">{pickText(nextProduct.name, locale).charAt(0)}</span></div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Dot Pills */}
      {hasMultiple && (
        <div className="flex items-center justify-center gap-1.5 mt-1">
          {products.map((p, idx) => (
            <button
              key={p._id}
              type="button"
              onClick={() => { setActiveIdx(idx); setIsFlipped(false) }}
              aria-label={`Product ${idx + 1}`}
              className={`transition-all rounded-full ${idx === activeIdx ? 'w-6 h-1.5 bg-gradient-to-r from-amber-400 to-amber-200' : 'w-1.5 h-1.5 bg-amber-700/40 hover:bg-amber-500/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// FOLDED SHELF COMPARTMENT (middle)
// ─────────────────────────────────────────────
interface FoldedShelfProps {
  products: Product[]
  onOpen: (product: Product) => void
}

function FoldedShelf({ products, onOpen }: FoldedShelfProps) {
  const { locale } = useApp()
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <div className="space-y-2">
      {/* Shelf label */}
      <div className="flex items-center gap-2 px-1">
        <div aria-hidden="true" className="h-px flex-1 bg-amber-700/30" />
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-amber-500/60">
          {locale === 'ar' ? 'الملابس المطوية' : locale === 'fr' ? 'Vêtements pliés' : 'Folded Garments'}
        </span>
        <div aria-hidden="true" className="h-px flex-1 bg-amber-700/30" />
      </div>

      {/* Wooden shelf board */}
      <div aria-hidden="true" className="h-2.5 w-full rounded-sm border-t border-amber-500/40 bg-gradient-to-b from-[#4a3520] via-[#3a2a18] to-[#2a1e10] shadow-md" />

      {/* Folded items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 px-1 pb-1">
        {products.map((item, idx) => {
          const name = pickText(item.name, locale)
          const img = item.images[0]?.url
          const isActive = idx === activeIdx
          return (
            <button
              key={item._id}
              type="button"
              onClick={() => { setActiveIdx(idx); onOpen(item) }}
              className={`group relative flex flex-col rounded-brand border transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'border-amber-400/60 bg-amber-500/10 shadow-[0_0_10px_rgba(212,175,55,0.2)]'
                  : 'border-amber-900/30 bg-black/15 hover:border-amber-500/40 hover:bg-amber-900/15'
              }`}
            >
              <div className="relative w-full aspect-square overflow-hidden bg-black/20">
                {img ? (
                  <img src={img} alt={name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-2xl text-gold/30">{name.charAt(0)}</span>
                  </div>
                )}
                {isActive && <div className="absolute inset-0 bg-amber-400/8 border-b-2 border-amber-400/50" />}
              </div>
              <div className="p-1.5 w-full text-center">
                <p className="line-clamp-1 font-display text-[11px] font-medium text-amber-100/80 group-hover:text-amber-300 transition-colors">{name}</p>
                <p className="mt-0.5 font-sans text-[10px] text-amber-400">{formatPrice(item.price, item.currency)}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Second shelf board */}
      <div aria-hidden="true" className="h-2.5 w-full rounded-sm border-t border-amber-500/40 bg-gradient-to-b from-[#4a3520] via-[#3a2a18] to-[#2a1e10] shadow-md" />
    </div>
  )
}

// ─────────────────────────────────────────────
// BOTTOM COMPARTMENT (accessories / shoes / perfumes)
// ─────────────────────────────────────────────
interface BottomCompartmentProps {
  products: Product[]
  onOpen: (product: Product) => void
}

function BottomCompartment({ products, onOpen }: BottomCompartmentProps) {
  const { locale } = useApp()
  const scrollRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 30 })

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <div aria-hidden="true" className="h-px flex-1 bg-amber-800/30" />
        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-amber-600/50">
          {locale === 'ar' ? 'الأحذية والإكسسوارات' : locale === 'fr' ? 'Chaussures & Accessoires' : 'Shoes & Accessories'}
        </span>
        <div aria-hidden="true" className="h-px flex-1 bg-amber-800/30" />
      </div>

      {/* Floor texture */}
      <div
        aria-hidden="true"
        className="h-1.5 w-full"
        style={{ background: 'repeating-linear-gradient(90deg, rgba(74,53,32,0.5) 0px, rgba(42,30,16,0.5) 1px, transparent 1px, transparent 24px)' }}
      />

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-none"
        style={{ scrollbarWidth: 'none' }}
      >
        {products.map((item) => {
          const name = pickText(item.name, locale)
          const img = item.images[0]?.url
          return (
            <button
              key={item._id}
              type="button"
              onClick={() => onOpen(item)}
              className="group flex-none flex flex-col items-center gap-1.5 w-24 sm:w-28"
            >
              <div className="relative w-full aspect-square rounded-brand border border-amber-900/30 bg-black/20 overflow-hidden group-hover:border-amber-500/40 transition-all">
                {img ? (
                  <img src={ensureTransparentUrl(img)} alt={name} loading="lazy" className="h-full w-full object-contain p-1.5 filter drop-shadow-[0_8px_12px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="font-display text-2xl text-gold/30">{name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <p className="line-clamp-1 font-display text-[10px] text-amber-200/70 group-hover:text-amber-300 text-center transition-colors">{name}</p>
              <p className="font-mono text-[9px] text-amber-500/70">{formatPrice(item.price, item.currency)}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// WARDROBE SCENE (main export)
// ─────────────────────────────────────────────

/**
 * WardrobeScene — 3-compartment luxury gentleman's wardrobe.
 *
 * Architecture:
 * - Dual wooden doors swing open on mount.
 * - TOP SECTION: Brass hanging rod with garment carousel (wardrobeSection === 'hanging' || unset).
 * - MIDDLE SECTION: Folded shelf display (wardrobeSection === 'folded').
 * - BOTTOM SECTION: Shoes/accessories horizontal strip (wardrobeSection === 'bottom').
 * - Products without wardrobeSection all appear in hanging rod.
 */
export function WardrobeScene({ products, intensity }: SceneProps) {
  const { t, locale } = useApp()
  const isRtl = LOCALE_DIRECTION[locale] === 'rtl'

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const animated = intensity !== 'low'

  // Group products by wardrobeSection
  const hangingProducts = products.filter(
    (p) => !p.wardrobeSection || p.wardrobeSection === 'hanging',
  )
  const foldedProducts = products.filter((p) => p.wardrobeSection === 'folded')
  const bottomProducts = products.filter((p) => p.wardrobeSection === 'bottom')

  // Open doors on mount
  useEffect(() => {
    const timer = setTimeout(() => setDoorsOpen(true), 120)
    return () => clearTimeout(timer)
  }, [])

  if (products.length === 0) return null

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border-4 border-amber-950/40 bg-[#16110c] shadow-2xl [perspective:1400px]"
      aria-label="Wardrobe collection showcase"
    >
      {/* ── INTERIOR AMBIENT GLOW ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_25%,rgba(212,175,55,0.13),transparent_60%)]"
      />

      {/* ── WARDROBE DOORS ── */}
      {animated && (
        <>
          {/* Left Door */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-0 z-30 w-1/2 border-e border-amber-950/70 bg-gradient-to-b from-[#2e2016] via-[#1e160e] to-[#13100a] shadow-2xl"
            style={{ transformOrigin: isRtl ? 'right center' : 'left center', backfaceVisibility: 'hidden' }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: doorsOpen ? (isRtl ? 108 : -108) : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-4 rounded border border-amber-600/20 bg-black/10" />
            {/* Wood grain lines */}
            <div className="absolute inset-6 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 18px, rgba(212,175,55,0.3) 18px, rgba(212,175,55,0.3) 19px)' }} />
            <div className="absolute end-3 top-1/2 -translate-y-1/2 h-14 w-1.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-md" />
          </motion.div>

          {/* Right Door */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 end-0 z-30 w-1/2 border-s border-amber-950/70 bg-gradient-to-b from-[#2e2016] via-[#1e160e] to-[#13100a] shadow-2xl"
            style={{ transformOrigin: isRtl ? 'left center' : 'right center', backfaceVisibility: 'hidden' }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: doorsOpen ? (isRtl ? -108 : 108) : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-4 rounded border border-amber-600/20 bg-black/10" />
            <div className="absolute inset-6 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 18px, rgba(212,175,55,0.3) 18px, rgba(212,175,55,0.3) 19px)' }} />
            <div className="absolute start-3 top-1/2 -translate-y-1/2 h-14 w-1.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-md" />
          </motion.div>
        </>
      )}

      {/* ── INTERIOR CONTENT ── */}
      <div className="relative z-10 py-8 sm:py-10 px-4 sm:px-6 space-y-5">

        {/* TOP BADGE */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1 font-sans text-xs uppercase tracking-[0.25em] text-amber-200/90">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            {t('rail.badge')}
          </span>
        </div>

        {/* ── HANGING ROD SECTION ── */}
        {hangingProducts.length > 0 && (
          <HangingCompartment products={hangingProducts} onOpen={setSelectedProduct} />
        )}

        {/* ── FOLDED SHELF SECTION ── */}
        {foldedProducts.length > 0 && (
          <FoldedShelf products={foldedProducts} onOpen={setSelectedProduct} />
        )}

        {/* ── BOTTOM COMPARTMENT SECTION ── */}
        {bottomProducts.length > 0 && (
          <BottomCompartment products={bottomProducts} onOpen={setSelectedProduct} />
        )}

        {/* ── FOOTER BAR ── */}
        <div className="border-t border-amber-800/30 pt-5 px-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
            <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-4 py-1.5 font-sans text-xs text-amber-200/70">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <span>{t('rail.instruction')}</span>
            </div>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-brand border border-amber-500/50 bg-amber-500/10 px-4 py-2 font-sans text-xs uppercase tracking-[0.2em] font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition-all"
            >
              <span>{t('rail.shopCollection')}</span>
              <span className="rtl:rotate-180">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── DETAIL CARD MODAL ── */}
      <AnimatePresence>
        {selectedProduct && (
          <SceneDetailCard product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </AnimatePresence>
    </section>
  )
}
