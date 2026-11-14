import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LOCALE_DIRECTION } from '@shared/constants/locales'
import { useApp } from '../app/useApp'
import { formatPrice } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

const DOOR_SPRING = { type: 'spring', stiffness: 45, damping: 14, mass: 1 } as const

/**
 * Ensures Cloudinary images have backgrounds removed cleanly and are served as transparent PNGs.
 */
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

// ─────────────────────────────────────────────────────────────
// 1. LEFT BAY: HANGING ROD SECTION ("asililar railscene gibi olacak")
// ─────────────────────────────────────────────────────────────
interface HangingBayProps {
  products: Product[]
  onOpen: (product: Product) => void
  isRtl: boolean
}

function HangingBay({ products, onOpen, isRtl }: HangingBayProps) {
  const { locale } = useApp()
  const [activeIdx, setActiveIdx] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const hasMultiple = products.length > 1

  const current = products[Math.min(activeIdx, products.length - 1)]
  const prevIdx = (activeIdx - 1 + products.length) % products.length
  const nextIdx = (activeIdx + 1) % products.length
  const prevProduct = hasMultiple ? products[prevIdx] : null
  const nextProduct = hasMultiple ? products[nextIdx] : null

  function handlePrev() {
    setActiveIdx((i) => (i - 1 + products.length) % products.length)
    setIsFlipped(false)
  }

  function handleNext() {
    setActiveIdx((i) => (i + 1) % products.length)
    setIsFlipped(false)
  }

  useEffect(() => {
    if (!hasMultiple) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') isRtl ? handleNext() : handlePrev()
      else if (e.key === 'ArrowRight') isRtl ? handlePrev() : handleNext()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hasMultiple, isRtl, products.length])

  if (!current) {
    return (
      <div className="flex h-64 items-center justify-center text-center p-6 text-amber-300/40 font-sans text-xs">
        {locale === 'ar' ? 'لا توجد قطع معلقة في هذا القسم' : 'No hanging garments'}
      </div>
    )
  }

  const frontImage = ensureTransparentUrl(current.images[0]?.url)
  const backImage = ensureTransparentUrl(current.images[1]?.url || current.images[0]?.url)
  const name = pickText(current.name, locale)

  return (
    <div className="relative flex flex-col justify-between w-full select-none pt-1">
      {/* ── Closet Rod (Straight Metallic Brushed Bar) ── */}
      <div className="relative w-full h-7 flex items-center z-30">
        <svg className="w-full h-7 overflow-visible" preserveAspectRatio="none" viewBox="0 0 1000 28">
          <rect x="0" y="10" width="1000" height="7" fill="rgba(0,0,0,0.55)" rx="3.5" />
          <rect x="0" y="7" width="1000" height="7" fill="url(#wardrobeBrassRodGrad)" rx="3.5" />
          <rect x="0" y="7.5" width="1000" height="1.8" fill="rgba(255,255,255,0.6)" rx="1" />
          <rect x="0" y="2" width="12" height="17" fill="url(#wardrobeFlangeGrad)" rx="2" />
          <rect x="988" y="2" width="12" height="17" fill="url(#wardrobeFlangeGrad)" rx="2" />
          <defs>
            <linearGradient id="wardrobeBrassRodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#785928" />
              <stop offset="25%" stopColor="#d4af37" />
              <stop offset="50%" stopColor="#fff3bf" />
              <stop offset="75%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#785928" />
            </linearGradient>
            <linearGradient id="wardrobeFlangeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffea9f" />
              <stop offset="50%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#5a3f18" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Garments On Rod with RailScene Carousel & 180° Flip ── */}
      <div className="relative flex items-start justify-center gap-3 sm:gap-6 -mt-3 pt-0 pb-2 min-h-[280px] sm:min-h-[320px]">
        {/* Previous Flanking Piece */}
        {hasMultiple && prevProduct && (
          <div
            onClick={isRtl ? handleNext : handlePrev}
            role="button"
            tabIndex={0}
            className="hidden sm:flex flex-col items-center cursor-pointer select-none w-24 sm:w-28 shrink-0 opacity-40 hover:opacity-85 transition-all duration-300 pt-3"
            style={{
              transform: isRtl
                ? 'scale(0.8) perspective(800px) rotateY(-18deg)'
                : 'scale(0.8) perspective(800px) rotateY(18deg)',
            }}
          >
            <div className="w-full h-[180px] sm:h-[220px]">
              <img
                src={ensureTransparentUrl(prevProduct.images[0]?.url)}
                alt=""
                className="h-full w-auto max-w-full mx-auto object-contain object-top filter drop-shadow-[0_16px_22px_rgba(0,0,0,0.6)] pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* Active Centered Garment (Directly Hung with Brass Hook) */}
        <div className="relative z-30 flex flex-col items-center select-none w-48 sm:w-60 shrink-0">
          <div
            onClick={() => {
              if (current.images.length > 1) {
                setIsFlipped((f) => !f)
              } else {
                onOpen(current)
              }
            }}
            className="group relative w-full cursor-pointer [perspective:1000px] flex flex-col items-center"
          >
            {/* Brass Hook anchored snugly ON the rod */}
            <div className="relative z-30 flex flex-col items-center pointer-events-none -mb-1">
              <svg className="w-7 h-10 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)]" viewBox="0 0 24 40" fill="none">
                <path
                  d="M 12 38 L 12 14 C 12 5 18 1 20 6 C 22 10 17 14 12 14"
                  stroke="url(#hangingHookGradWardrobe)"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <ellipse cx="12" cy="38" rx="3.5" ry="1.8" fill="url(#hangingHookGradWardrobe)" stroke="#785928" strokeWidth="0.8" />
                <defs>
                  <linearGradient id="hangingHookGradWardrobe" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fff3bf" />
                    <stop offset="50%" stopColor="#d4af37" />
                    <stop offset="100%" stopColor="#785928" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Suspended Price Tag */}
            <div className="absolute top-8 start-4 sm:start-6 z-40 pointer-events-none">
              <div className="w-px h-5 bg-amber-300/80 mx-auto" />
              <div className="rounded-[3px] border border-amber-600/60 bg-[#1a1714] px-2 py-0.5 shadow-lg flex flex-col items-center">
                <div className="w-1 h-1 rounded-full border border-gold/60 bg-gold/30 mb-0.5" />
                <span className="font-mono text-[9px] font-bold text-amber-300 whitespace-nowrap">
                  {formatPrice(current.price, current.currency)}
                </span>
              </div>
            </div>

            {/* 3D Garment Body with Smooth 180° Flip */}
            <div className="relative w-full h-[210px] sm:h-[250px] z-20">
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformStyle: 'preserve-3d' }}
                className="relative w-full h-full flex flex-col items-center justify-start group-hover:-translate-y-1.5 transition-transform duration-300"
              >
                {/* Front Face */}
                <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0 flex flex-col items-center justify-start">
                  {frontImage ? (
                    <img
                      src={frontImage}
                      alt={name}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-auto max-w-full object-contain object-top filter drop-shadow-[0_20px_28px_rgba(0,0,0,0.7)] group-hover:scale-[1.03] transition-transform duration-300 pointer-events-none"
                    />
                  ) : (
                    <div className="flex h-44 w-32 items-center justify-center rounded-2xl border border-dashed border-gold/40 bg-gold/5">
                      <span className="font-display text-4xl text-gold/40">{name.charAt(0)}</span>
                    </div>
                  )}
                  {current.images.length > 1 && (
                    <span className="absolute bottom-0 rounded-full border border-gold/40 bg-black/80 px-2.5 py-0.5 font-sans text-[9px] uppercase tracking-wider text-gold-light opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                      180° Flip
                    </span>
                  )}
                </div>

                {/* Back Face */}
                <div
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 flex flex-col items-center justify-start"
                >
                  {backImage ? (
                    <img
                      src={backImage}
                      alt={`${name} back`}
                      loading="lazy"
                      draggable={false}
                      className="h-full w-auto max-w-full object-contain object-top filter drop-shadow-[0_20px_28px_rgba(0,0,0,0.7)] pointer-events-none"
                    />
                  ) : null}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Product Title & Navigation */}
          <div className="mt-1 text-center w-full px-2">
            <Link
              to={`/product/${current.slug}`}
              className="font-display text-sm font-semibold text-amber-100 hover:text-amber-300 transition-colors line-clamp-1"
            >
              {name}
            </Link>
            <button
              type="button"
              onClick={() => onOpen(current)}
              className="mt-0.5 inline-flex items-center gap-1 font-sans text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300 font-bold"
            >
              <span>{locale === 'ar' ? 'معاينة القطعة' : 'Inspect Piece'}</span>
              <span className="rtl:rotate-180">→</span>
            </button>
          </div>
        </div>

        {/* Next Flanking Piece */}
        {hasMultiple && nextProduct && (
          <div
            onClick={isRtl ? handlePrev : handleNext}
            role="button"
            tabIndex={0}
            className="hidden sm:flex flex-col items-center cursor-pointer select-none w-24 sm:w-28 shrink-0 opacity-40 hover:opacity-85 transition-all duration-300 pt-3"
            style={{
              transform: isRtl
                ? 'scale(0.8) perspective(800px) rotateY(18deg)'
                : 'scale(0.8) perspective(800px) rotateY(-18deg)',
            }}
          >
            <div className="w-full h-[180px] sm:h-[220px]">
              <img
                src={ensureTransparentUrl(nextProduct.images[0]?.url)}
                alt=""
                className="h-full w-auto max-w-full mx-auto object-contain object-top filter drop-shadow-[0_16px_22px_rgba(0,0,0,0.6)] pointer-events-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Hanging Carousel Controls */}
      {hasMultiple && (
        <div className="flex items-center justify-center gap-2 mt-1">
          <button
            type="button"
            onClick={isRtl ? handleNext : handlePrev}
            className="w-6 h-6 rounded-full border border-amber-700/40 bg-amber-950/60 text-amber-300 hover:bg-amber-600 hover:text-black flex items-center justify-center text-xs font-bold transition-colors"
          >
            {isRtl ? '→' : '←'}
          </button>
          <span className="font-mono text-[10px] text-amber-400/80">
            {activeIdx + 1} / {products.length}
          </span>
          <button
            type="button"
            onClick={isRtl ? handlePrev : handleNext}
            className="w-6 h-6 rounded-full border border-amber-700/40 bg-amber-950/60 text-amber-300 hover:bg-amber-600 hover:text-black flex items-center justify-center text-xs font-bold transition-colors"
          >
            {isRtl ? '←' : '→'}
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 2. LEFT BAY BOTTOM: SINGLE LARGE OPENABLE DRAWER ("tek buyuk cekmece")
//    Natural luxury drawer interior with recessed velvet compartments.
//    Interactive lift & spotlight inspection on click!
// ─────────────────────────────────────────────────────────────
interface SingleLargeDrawerProps {
  products: Product[]
  onOpenModal: (product: Product) => void
}

function SingleLargeDrawer({ products, onOpenModal }: SingleLargeDrawerProps) {
  const { locale } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [isDetailView, setIsDetailView] = useState(false)

  function handleProductClick(product: Product) {
    if (activeItemId === product._id) {
      // If already active and has multiple images, toggle between hero and detail
      if (product.images.length > 1) {
        setIsDetailView((prev) => !prev)
      } else {
        // Return back to slot
        setActiveItemId(null)
        setIsDetailView(false)
      }
    } else {
      // Lift new item into spotlight
      setActiveItemId(product._id)
      setIsDetailView(false)
    }
  }

  return (
    <div className="relative w-full mt-4 select-none">
      {/* ── Top Wood/Marble Edge of Drawer Bench ── */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-700/40 via-amber-400/80 to-amber-700/40 shadow-xs" />

      {/* ── Single Large Drawer Box Frame ── */}
      <div className="rounded-b-lg border border-amber-900/60 bg-gradient-to-b from-[#241910] via-[#1a110a] to-[#120b06] p-3 sm:p-4 shadow-xl">
        {/* Header Bar with Status and Open/Close Toggle */}
        <div className="flex items-center justify-between pb-2.5 border-b border-amber-900/40">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-amber-300">
              {locale === 'ar' ? 'الدرج الكبير للأحذية والعطور' : locale === 'fr' ? 'Grand Tiroir Chaussures & Parfums' : 'Large Boutique Drawer'}
            </span>
            {products.length > 0 && (
              <span className="font-mono text-[9px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {products.length} {locale === 'ar' ? 'قطع' : 'items'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev)
              if (isOpen) {
                setActiveItemId(null)
                setIsDetailView(false)
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/50 bg-amber-500/15 hover:bg-amber-500 hover:text-black font-sans text-xs font-bold text-amber-200 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span>
              {isOpen
                ? (locale === 'ar' ? 'إغلاق الدرج' : 'Close Drawer')
                : (locale === 'ar' ? 'انقر لفتح الدرج' : 'Open Drawer')}
            </span>
          </button>
        </div>

        {/* ── Closed Drawer Front Facade ── */}
        <div className="mt-3">
          <div
            onClick={() => setIsOpen((prev) => !prev)}
            role="button"
            tabIndex={0}
            className="relative h-14 rounded-md border border-amber-800/40 bg-gradient-to-b from-[#2e1f14] via-[#22160d] to-[#170e08] flex items-center justify-center shadow-inner cursor-pointer group hover:border-amber-600/50 transition-colors"
          >
            {/* Elegant Long Brass Horizontal Groove Handle */}
            <div className="w-44 sm:w-56 h-2 rounded-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 shadow-xs group-hover:via-amber-200 transition-colors" />

            <span className="absolute bottom-1.5 font-mono text-[9px] text-amber-500/50 tracking-widest uppercase">
              {isOpen ? (locale === 'ar' ? 'مفتوح' : 'OPEN') : (locale === 'ar' ? 'اسحب لفتح الدرج' : 'PULL TO OPEN')}
            </span>
          </div>

          {/* ── Pulled-Out Luxury Velvet Drawer Tray (Authentic 3D Depth) ── */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="overflow-hidden mt-3 rounded-lg border-2 border-amber-700/60 bg-gradient-to-b from-[#19110a] via-[#0f0905] to-[#070402] p-3 sm:p-4 shadow-[0_20px_35px_rgba(0,0,0,0.95)]"
              >
                {/* Drawer Interior Rim & Ambient Glow */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-900/50">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-amber-300/90">
                      {locale === 'ar' ? 'بطانة المخمل الفاخرة — انقر على أي قطعة لرفعها وفحصها' : 'Velvet Lined Tray — Tap any piece to lift & inspect'}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-amber-500/60 uppercase tracking-widest">
                    Atelier Organizer
                  </span>
                </div>

                {/* Natural Recessed Velvet Compartments Row */}
                {products.length > 0 ? (
                  <div className="relative pt-4 pb-2">
                    <div className="flex items-end justify-center sm:justify-start gap-4 sm:gap-6 overflow-x-auto pb-4 pt-8 px-2 scrollbar-none">
                      {products.map((item) => {
                        const name = pickText(item.name, locale)
                        const isLifted = activeItemId === item._id
                        const hasDetail = item.images.length > 1
                        const currentImg = isLifted && isDetailView && hasDetail
                          ? ensureTransparentUrl(item.images[1]?.url)
                          : ensureTransparentUrl(item.images[0]?.url)

                        return (
                          <div
                            key={item._id}
                            className="relative flex-none flex flex-col items-center w-32 sm:w-36 select-none"
                          >
                            {/* ── Recessed Velvet Slot Cushion (The physical compartment) ── */}
                            <div
                              onClick={() => handleProductClick(item)}
                              role="button"
                              tabIndex={0}
                              className={`relative w-full h-36 sm:h-40 rounded-lg border cursor-pointer transition-all duration-300 flex items-center justify-center p-2 ${
                                isLifted
                                  ? 'border-amber-400/80 bg-gradient-to-b from-amber-950/40 to-black/90 shadow-[inset_0_4px_16px_rgba(0,0,0,0.9),0_0_15px_rgba(212,175,55,0.25)]'
                                  : 'border-amber-900/40 bg-gradient-to-b from-[#140d08] via-[#0c0805] to-[#060402] shadow-[inset_0_4px_14px_rgba(0,0,0,0.9)] hover:border-amber-600/60'
                              }`}
                            >
                              {/* Velvet cushion indent lines */}
                              <div
                                aria-hidden="true"
                                className="absolute inset-1.5 rounded border border-amber-900/20 pointer-events-none"
                              />

                              {/* Soft Contact Shadow on Velvet Floor */}
                              <div
                                aria-hidden="true"
                                className={`absolute bottom-3 w-20 sm:w-24 h-2.5 rounded-[50%] bg-black/95 blur-[2.5px] transition-all duration-300 pointer-events-none ${
                                  isLifted ? 'scale-75 opacity-40' : 'scale-100 opacity-90'
                                }`}
                              />

                              {/* ── The Product (Lifts up out of slot into spotlight when clicked!) ── */}
                              <motion.div
                                animate={
                                  isLifted
                                    ? { y: -26, scale: 1.16, rotate: 0 }
                                    : { y: 0, scale: 1, rotate: 0 }
                                }
                                transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                                className="relative z-20 flex flex-col items-center justify-center w-full h-full"
                              >
                                {currentImg ? (
                                  <img
                                    src={currentImg}
                                    alt={name}
                                    loading="lazy"
                                    className={`max-h-full max-w-full object-contain filter pointer-events-none transition-all duration-300 ${
                                      isLifted
                                        ? 'drop-shadow-[0_22px_28px_rgba(0,0,0,0.95)] drop-shadow-[0_0_12px_rgba(212,175,55,0.35)]'
                                        : 'drop-shadow-[0_8px_14px_rgba(0,0,0,0.85)] group-hover:scale-105'
                                    }`}
                                  />
                                ) : (
                                  <span className="font-display text-2xl text-amber-400/40">{name.charAt(0)}</span>
                                )}

                                {/* Floating Action Tag when Lifted */}
                                {isLifted && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 6 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="absolute -top-6 rounded-full border border-amber-400 bg-black/90 px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider text-amber-200 shadow-md backdrop-blur-xs whitespace-nowrap"
                                  >
                                    {hasDetail
                                      ? isDetailView
                                        ? (locale === 'ar' ? 'عرض الوجه الرئيسي' : 'Hero View')
                                        : (locale === 'ar' ? 'عرض التفصيل / الزاوية' : 'Detail View')
                                      : (locale === 'ar' ? 'مرفوع للفحص' : 'Inspecting')}
                                  </motion.div>
                                )}
                              </motion.div>
                            </div>

                            {/* Label & Price Below Slot */}
                            <div className="mt-2 text-center w-full px-1">
                              <span className="line-clamp-1 font-display text-xs text-amber-100 font-medium">
                                {name}
                              </span>
                              <span className="font-mono text-[11px] font-bold text-amber-400 mt-0.5 block">
                                {formatPrice(item.price, item.currency)}
                              </span>
                            </div>

                            {/* Inspection Actions Bar when Lifted */}
                            {isLifted && (
                              <motion.div
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1.5 flex items-center justify-center gap-2 w-full"
                              >
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onOpenModal(item)
                                  }}
                                  className="font-sans text-[10px] font-bold uppercase tracking-wider text-amber-300 hover:text-amber-100 underline underline-offset-2 cursor-pointer"
                                >
                                  {locale === 'ar' ? 'تفاصيل' : 'Details'} →
                                </button>
                                <span className="text-amber-700 text-xs">•</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveItemId(null)
                                    setIsDetailView(false)
                                  }}
                                  className="font-sans text-[10px] font-medium text-amber-500/80 hover:text-amber-300 cursor-pointer"
                                >
                                  {locale === 'ar' ? 'إعادة' : 'Return'}
                                </button>
                              </motion.div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-amber-400/60 font-sans text-xs">
                    {locale === 'ar'
                      ? 'الدرج مفتوح وجاهز — خصص منتجات (أحذية / عطور) للقسم السفلي لتظهر هنا داخل حجيرات المخمل'
                      : 'Drawer is open — assign bottom section products to display here in custom velvet slots'}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// 3. RIGHT BAY: 5-TIER SHELVING TOWER & STACKED FOLDED CLOTHES
//    ("katlanmislar isebirbirinin ustunde olacaklar yandan gozukuyor
//     siradakiler iki uc tanesi katlanmis sekilleri arka plansiz
//     tiklayinca acilir tiklayincaen asagiya gider")
// ─────────────────────────────────────────────────────────────
interface FoldedStackShelfProps {
  products: Product[]
  onOpenModal: (product: Product) => void
}

function FoldedStackShelf({ products, onOpenModal }: FoldedStackShelfProps) {
  const { locale } = useApp()
  const [order, setOrder] = useState<number[]>(() => products.map((_, i) => i))
  const [isUnfolded, setIsUnfolded] = useState(false)
  const [isSendingToBottom, setIsSendingToBottom] = useState(false)

  useEffect(() => {
    setOrder(products.map((_, i) => i))
  }, [products])

  if (products.length === 0) return null

  const activeIdx = order[0] ?? 0
  const current = products[activeIdx]
  if (!current) return null

  const name = pickText(current.name, locale)
  const hasMultiple = products.length > 1

  const foldedUrl = ensureTransparentUrl(current.images[0]?.url)
  const unfoldedUrl = current.images.length > 1 ? ensureTransparentUrl(current.images[1]?.url) : foldedUrl
  const canUnfold = current.images.length > 1

  // 2 or 3 items visible underneath in the stack (from the side / depth)
  const under1 = order.length > 1 ? products[order[1]] : null
  const under2 = order.length > 2 ? products[order[2]] : null
  const under3 = order.length > 3 ? products[order[3]] : null

  function handleStackClick() {
    if (!canUnfold) {
      if (hasMultiple) {
        cycleToBottom()
      } else {
        onOpenModal(current)
      }
      return
    }

    if (!isUnfolded) {
      setIsUnfolded(true)
    } else {
      cycleToBottom()
    }
  }

  function cycleToBottom() {
    setIsSendingToBottom(true)
    setIsUnfolded(false)
    setTimeout(() => {
      setOrder((prev) => {
        if (prev.length <= 1) return prev
        const next = [...prev]
        const first = next.shift()!
        next.push(first)
        return next
      })
      setIsSendingToBottom(false)
    }, 280)
  }

  function handlePrev() {
    if (!hasMultiple) return
    setIsUnfolded(false)
    setOrder((prev) => {
      const next = [...prev]
      const last = next.pop()!
      next.unshift(last)
      return next
    })
  }

  function handleNext() {
    if (!hasMultiple) return
    setIsUnfolded(false)
    setOrder((prev) => {
      const next = [...prev]
      const first = next.shift()!
      next.push(first)
      return next
    })
  }

  return (
    <div className="relative flex flex-col items-center justify-between h-full w-full select-none">
      {/* ── Shelf Cubby Header ── */}
      <div className="flex items-center justify-between w-full px-2 pb-1.5 border-b border-amber-900/40">
        <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          {locale === 'ar' ? 'رف الملابس المطوية (حزمة)' : 'Folded Boutique Stack'}
        </span>
        {hasMultiple && (
          <span className="font-mono text-[9px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {products.length} {locale === 'ar' ? 'قطع' : 'items'}
          </span>
        )}
      </div>

      {/* ── Interactive Stacked Garments Area (Card Stack with peeking corners) ── */}
      <div className="relative w-full flex-1 flex flex-col items-center justify-center min-h-[250px] sm:min-h-[280px] pt-4 overflow-visible">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-8 h-32 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.18)_0%,transparent_70%)]"
        />

        <div
          onClick={handleStackClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              handleStackClick()
            }
          }}
          className="relative z-10 flex flex-col items-center justify-center cursor-pointer w-full focus:outline-none overflow-visible"
          title={
            canUnfold
              ? isUnfolded
                ? locale === 'ar'
                  ? 'انقر للطي والإرسال لأسفل الحزمة للانتقال للتالي'
                  : 'Click to fold & send to bottom of stack'
                : locale === 'ar'
                  ? 'انقر لفتح القطعة'
                  : 'Click to unfold piece'
              : name
          }
        >
          <div className="relative min-h-[200px] sm:min-h-[230px] w-full flex items-center justify-center px-4 overflow-visible">
            {/* ── Visual Card Stack Underneath (Next item peeks bottom-RIGHT, after that peeks bottom-LEFT) ── */}
            {!isUnfolded && (
              <>
                {/* 3rd item underneath (centered deep in stack) */}
                {under3 && (
                  <motion.div
                    key={`under3-${under3._id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 0.6, x: 0, y: 26, scale: 0.9, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    aria-hidden="true"
                    className="absolute pointer-events-none z-[1]"
                  >
                    <img
                      src={ensureTransparentUrl(under3.images[0]?.url)}
                      alt=""
                      draggable={false}
                      className="max-h-40 sm:max-h-46 w-auto object-contain filter drop-shadow-[0_8px_14px_rgba(0,0,0,0.8)]"
                    />
                  </motion.div>
                )}

                {/* 2nd item underneath: Peeks out from bottom-LEFT ("onun sonraki onun altinda soldan kosesi gozuksun") */}
                {under2 && (
                  <motion.div
                    key={`under2-${under2._id}`}
                    initial={{ opacity: 0, x: -20, y: 10, rotate: -3 }}
                    animate={{ opacity: 0.92, x: -38, y: 20, rotate: -6, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrev()
                    }}
                    className="absolute z-[2] cursor-pointer group"
                    title={pickText(under2.name, locale)}
                  >
                    <img
                      src={ensureTransparentUrl(under2.images[0]?.url)}
                      alt=""
                      draggable={false}
                      className="max-h-44 sm:max-h-50 w-auto object-contain filter drop-shadow-[0_14px_22px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform"
                    />
                  </motion.div>
                )}

                {/* 1st item underneath: Peeks out from bottom-RIGHT ("siradaki foto alttan sagdan ... gozuksun") */}
                {under1 && (
                  <motion.div
                    key={`under1-${under1._id}`}
                    initial={{ opacity: 0, x: 20, y: 8, rotate: 3 }}
                    animate={{ opacity: 0.96, x: 36, y: 14, rotate: 5.5, scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNext()
                    }}
                    className="absolute z-[5] cursor-pointer group"
                    title={pickText(under1.name, locale)}
                  >
                    <img
                      src={ensureTransparentUrl(under1.images[0]?.url)}
                      alt=""
                      draggable={false}
                      className="max-h-44 sm:max-h-50 w-auto object-contain filter drop-shadow-[0_14px_22px_rgba(0,0,0,0.88)] group-hover:scale-105 transition-transform"
                    />
                  </motion.div>
                )}
              </>
            )}

            {/* Active Top Garment (Centered, Z-Index 20) */}
            <AnimatePresence mode="wait">
              {!isUnfolded ? (
                <motion.div
                  key={`folded-${current._id}`}
                  initial={{ opacity: 0, y: isSendingToBottom ? 30 : -15, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 35, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 25 }}
                  className="relative z-20 flex flex-col items-center"
                >
                  <img
                    src={foldedUrl}
                    alt={name}
                    loading="lazy"
                    draggable={false}
                    className="relative z-10 max-h-44 sm:max-h-52 w-auto object-contain filter drop-shadow-[0_20px_28px_rgba(0,0,0,0.92)] hover:scale-105 transition-transform duration-300 pointer-events-none"
                  />
                  <span className="absolute -bottom-2 z-20 rounded-full border border-amber-400/60 bg-black/85 px-3 py-0.5 font-sans text-[10px] uppercase tracking-wider text-amber-300 shadow-md">
                    {canUnfold
                      ? locale === 'ar' ? 'انقر لفتح القطعة' : 'Tap to Unfold'
                      : locale === 'ar' ? 'انقر للتالي' : 'Tap for Next'}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key={`unfolded-${current._id}`}
                  initial={{ opacity: 0, scale: 0.85, y: 15 }}
                  animate={{ opacity: 1, scale: 1.05, y: 0 }}
                  exit={{ opacity: 0, scale: 0.88, y: 30 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="relative z-30 flex flex-col items-center"
                >
                  <img
                    src={unfoldedUrl}
                    alt={`${name} unfolded`}
                    loading="lazy"
                    draggable={false}
                    className="relative z-10 max-h-52 sm:max-h-60 w-auto object-contain filter drop-shadow-[0_22px_32px_rgba(212,175,55,0.45)] pointer-events-none"
                  />
                  <span className="absolute -bottom-2 z-30 rounded-full border border-amber-400 bg-amber-500/25 px-3 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-amber-200 backdrop-blur-xs shadow-lg animate-pulse">
                    {locale === 'ar' ? 'طي ونقل لأسفل الحزمة للتالي' : 'Fold and Send to Bottom'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div
            aria-hidden="true"
            className="w-44 sm:w-56 h-3.5 rounded-[50%] bg-black/85 blur-[3px] mt-3 pointer-events-none"
          />
        </div>
      </div>

      {/* Shelf Plank */}
      <div aria-hidden="true" className="relative w-full mt-1">
        <div className="h-0.5 w-full bg-gradient-to-r from-amber-700/30 via-amber-400/80 to-amber-700/30" />
        <div className="h-3 w-full bg-gradient-to-b from-[#3a2717] via-[#281a0e] to-[#150d07] border-t border-amber-500/40 border-b border-black shadow-md" />
      </div>

      {/* Shelf Placard & Nav Arrows */}
      <div className="mt-2.5 flex items-center justify-between w-full px-2 gap-2">
        {hasMultiple && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous folded piece"
            className="w-7 h-7 rounded-full border border-amber-600/40 bg-amber-950/60 hover:bg-amber-600 hover:text-black text-amber-300 flex items-center justify-center transition-colors text-xs font-bold shrink-0"
          >
            ←
          </button>
        )}

        <div className="text-center flex-1 min-w-0">
          <Link
            to={`/product/${current.slug}`}
            className="font-display text-xs sm:text-sm font-semibold text-amber-100 hover:text-amber-300 transition-colors line-clamp-1"
          >
            {name}
          </Link>
          <div className="flex items-center justify-center gap-2 mt-0.5">
            <span className="font-mono text-xs font-bold text-amber-400">
              {formatPrice(current.price, current.currency)}
            </span>
            <span className="text-amber-600 text-xs">•</span>
            <button
              type="button"
              onClick={() => onOpenModal(current)}
              className="font-sans text-[11px] text-amber-300 hover:text-amber-200 uppercase tracking-widest font-bold underline underline-offset-2"
            >
              {locale === 'ar' ? 'عرض التفاصيل' : 'Details'} →
            </button>
          </div>
        </div>

        {hasMultiple && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next folded piece"
            className="w-7 h-7 rounded-full border border-amber-600/40 bg-amber-950/60 hover:bg-amber-600 hover:text-black text-amber-300 flex items-center justify-center transition-colors text-xs font-bold shrink-0"
          >
            →
          </button>
        )}
      </div>
    </div>
  )
}

function DecorativeShelfLevel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col justify-between p-2.5 border-b border-amber-900/40 bg-black/20">
      <div className="flex items-center justify-between">
        <span className="font-sans text-[10px] uppercase tracking-widest text-amber-400/70">{title}</span>
        <span className="font-mono text-[9px] text-amber-500/50">{subtitle}</span>
      </div>
      <div className="h-6 flex items-center justify-center">
        <div className="w-16 h-1 rounded-full bg-amber-800/30" />
      </div>
      <div aria-hidden="true" className="h-2 w-full bg-gradient-to-b from-[#2e1d13] to-[#1a1009] border-t border-amber-600/30 rounded-xs" />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// WARDROBE SCENE (Main Storefront Component — 2-Bay Architectural Layout)
// ─────────────────────────────────────────────────────────────
export function WardrobeScene({ products, intensity }: SceneProps) {
  const { t, locale } = useApp()
  const isRtl = LOCALE_DIRECTION[locale] === 'rtl'

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [doorsOpen, setDoorsOpen] = useState(false)
  const animated = intensity !== 'low'

  const foldedProducts = products.filter((p) => p.wardrobeSection === 'folded')
  const bottomProducts = products.filter((p) => p.wardrobeSection === 'bottom')
  const hangingProducts = products.filter(
    (p) =>
      p.wardrobeSection === 'hanging' ||
      (!p.wardrobeSection && p.wardrobeSection !== 'folded' && p.wardrobeSection !== 'bottom'),
  )

  useEffect(() => {
    const timer = setTimeout(() => setDoorsOpen(true), 120)
    return () => clearTimeout(timer)
  }, [])

  if (products.length === 0) return null

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl border-4 border-amber-950/80 bg-[#120e0a] shadow-[0_30px_70px_rgba(0,0,0,0.95)] [perspective:1400px]"
      aria-label="Classy Men Royal Wardrobe Showcase"
    >
      {/* ── Interior Ambient Spotlights ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.18),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_80%_35%,rgba(212,175,55,0.14),transparent_55%)]"
      />

      {/* ── 3D Dual Smoked Oak Wardrobe Doors ── */}
      {animated && (
        <>
          {/* Left Door */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-0 z-40 w-1/2 border-e-2 border-amber-950 bg-gradient-to-b from-[#2e1d13] via-[#1f140c] to-[#120c07] shadow-2xl overflow-hidden"
            style={{ transformOrigin: isRtl ? 'right center' : 'left center', backfaceVisibility: 'hidden' }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: doorsOpen ? (isRtl ? 108 : -108) : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-5 rounded border border-amber-500/25 bg-black/20" />
            <div
              className="absolute inset-8 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(180deg, transparent, transparent 16px, rgba(212,175,55,0.4) 16px, rgba(212,175,55,0.4) 17px)',
              }}
            />
            <div className="absolute end-4 top-1/2 -translate-y-1/2 h-16 w-2 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 shadow-lg" />
          </motion.div>

          {/* Right Door */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 end-0 z-40 w-1/2 border-s-2 border-amber-950 bg-gradient-to-b from-[#2e1d13] via-[#1f140c] to-[#120c07] shadow-2xl overflow-hidden"
            style={{ transformOrigin: isRtl ? 'left center' : 'right center', backfaceVisibility: 'hidden' }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: doorsOpen ? (isRtl ? -108 : 108) : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-5 rounded border border-amber-500/25 bg-black/20" />
            <div
              className="absolute inset-8 opacity-10"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(180deg, transparent, transparent 16px, rgba(212,175,55,0.4) 16px, rgba(212,175,55,0.4) 17px)',
              }}
            />
            <div className="absolute start-4 top-1/2 -translate-y-1/2 h-16 w-2 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 shadow-lg" />
          </motion.div>
        </>
      )}

      {/* ── WARDROBE INTERIOR ── */}
      <div className="relative z-10 py-7 sm:py-9 px-4 sm:px-8 space-y-6">
        {/* Royal Wardrobe Badge */}
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 font-sans text-xs uppercase tracking-[0.25em] text-amber-200/95 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
            {locale === 'ar' ? 'خزانة ملابس كلاسي ريم الملكية' : locale === 'fr' ? 'Garde-Robe Royale Classy Men' : 'Classy Men Royal Wardrobe'}
          </span>
        </div>

        {/* ── ARCHITECTURAL CLOSET (Matching Reference Photo) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch rounded-xl border border-amber-900/50 bg-[#16110c]/85 shadow-2xl overflow-hidden">
          {/* ── LEFT BAY (7/12): Hanging Rod Bay + Single Large Openable Drawer Chest ── */}
          <div className="lg:col-span-7 p-4 sm:p-6 flex flex-col justify-between border-b lg:border-b-0 lg:border-e border-amber-900/50">
            {/* Top Hanging Rod with RailScene-like carousel */}
            <HangingBay products={hangingProducts} onOpen={setSelectedProduct} isRtl={isRtl} />

            {/* Bottom Single Large Drawer Unit */}
            <SingleLargeDrawer products={bottomProducts} onOpenModal={setSelectedProduct} />
          </div>

          {/* ── RIGHT BAY (5/12): 5-Tier Shelving Tower with Stacked Folded Clothes ── */}
          <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-[#140e09]/70">
            {/* Top Decorative Cubby (Level 1) */}
            <DecorativeShelfLevel
              title={locale === 'ar' ? 'الرف العلوي' : 'Top Shelf'}
              subtitle="Atelier Archive"
            />

            {/* Folded Clothes Stack (Level 2/3) */}
            <div className="my-2 flex-1 flex flex-col justify-center">
              <FoldedStackShelf products={foldedProducts} onOpenModal={setSelectedProduct} />
            </div>

            {/* Lower Decorative Cubby (Level 4/5) */}
            <DecorativeShelfLevel
              title={locale === 'ar' ? 'الرف السفلي' : 'Lower Cubby'}
              subtitle="Luxury Knitwear"
            />
          </div>
        </div>

        {/* ── FOOTER BAR ── */}
        <div className="border-t border-amber-900/40 pt-4 px-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-start">
            <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/5 px-4 py-1.5 font-sans text-xs text-amber-200/80">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <span>{t('rail.instruction')}</span>
            </div>
            <Link
              to="/catalog"
              className="inline-flex items-center gap-2 rounded-brand border border-amber-500/50 bg-amber-500/10 px-5 py-2 font-sans text-xs uppercase tracking-[0.2em] font-bold text-amber-300 hover:bg-amber-500 hover:text-black transition-all"
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
