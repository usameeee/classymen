import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LOCALE_DIRECTION } from '@shared/constants/locales'
import { useApp } from '../app/useApp'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

const DOOR_SPRING = { type: 'spring', stiffness: 50, damping: 14, mass: 1 } as const
const ITEM_SPRING = { type: 'spring', stiffness: 240, damping: 24, mass: 0.8 } as const

/** Partition products into wardrobe sections: hanging rod, folded shelves, bottom shoe tier. */
function partitionWardrobe(products: Product[]): {
  hanging: Product[]
  shelved: Product[]
  bottom: Product[]
} {
  if (products.length <= 4) {
    return { hanging: products, shelved: [], bottom: [] }
  }
  if (products.length <= 8) {
    const hangingCount = Math.ceil(products.length * 0.6)
    return {
      hanging: products.slice(0, hangingCount),
      shelved: products.slice(hangingCount),
      bottom: [],
    }
  }

  // 1/2 hanging, 1/3 shelves, remainder bottom
  const hangingCount = Math.max(3, Math.floor(products.length * 0.5))
  const remaining = products.length - hangingCount
  const shelvedCount = Math.floor(remaining * 0.6)

  return {
    hanging: products.slice(0, hangingCount),
    shelved: products.slice(hangingCount, hangingCount + shelvedCount),
    bottom: products.slice(hangingCount + shelvedCount),
  }
}

/** Measures container width to adjust shelf columns dynamically. */
function useShelfColumns(ref: RefObject<HTMLElement | null>): number {
  const [columns, setColumns] = useState(3)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      const width = element.clientWidth
      setColumns(width < 500 ? 2 : width < 800 ? 3 : 4)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return columns
}

interface WardrobeItemProps {
  product: Product
  index: number
  variant: 'hanger' | 'folded' | 'shoe'
  animated: boolean
  onOpen: (product: Product) => void
}

function WardrobeItem({ product, index, variant, animated, onOpen }: WardrobeItemProps) {
  const { locale } = useApp()
  const image = primaryImage(product)
  const name = pickText(product.name, locale)

  if (variant === 'hanger') {
    return (
      <motion.div
        className="flex w-36 shrink-0 flex-col items-center sm:w-44"
        initial={animated ? { opacity: 0, y: -16 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 + index * 0.05, ...ITEM_SPRING }}
      >
        {/* Brass hanger hook and triangular neck */}
        <span aria-hidden="true" className="h-4 w-px bg-amber-400/80 shadow-[0_0_6px_rgba(251,191,36,0.3)]" />
        <div aria-hidden="true" className="mb-1.5 flex h-2.5 w-10 items-center justify-center">
          <span className="h-px w-full bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
        </div>

        <button
          type="button"
          onClick={() => onOpen(product)}
          className="group relative block w-full overflow-hidden rounded-brand border border-amber-900/30 bg-cream-card/95 text-start shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:-translate-y-1.5 focus-visible:outline-none dark:bg-[#1f1913]/95"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-amber-950/10">
            {image ? (
              <img
                src={image.url}
                alt={image.alt ?? name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-display text-4xl text-gold/30">{name.charAt(0)}</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          <div className="p-3">
            <h3 className="line-clamp-1 font-display text-sm font-medium text-ink transition-colors group-hover:text-gold">
              {name}
            </h3>
            <p className="mt-1 font-sans text-xs text-gold">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
        </button>
      </motion.div>
    )
  }

  // Folded on shelf or bottom shoe tier
  return (
    <motion.button
      type="button"
      onClick={() => onOpen(product)}
      className="group relative block w-full overflow-hidden rounded-brand border border-amber-900/20 bg-cream-card/90 text-start shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:-translate-y-1 focus-visible:outline-none dark:bg-[#1a1510]/90"
      initial={animated ? { opacity: 0, y: 12 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.04, ...ITEM_SPRING }}
    >
      <div className={`relative ${variant === 'shoe' ? 'aspect-[4/3]' : 'aspect-square'} overflow-hidden bg-amber-950/10`}>
        {image ? (
          <img
            src={image.url}
            alt={image.alt ?? name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-3xl text-gold/30">{name.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h4 className="line-clamp-1 font-display text-xs font-medium text-ink transition-colors group-hover:text-gold">
          {name}
        </h4>
        <p className="mt-0.5 font-sans text-xs text-gold">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </motion.button>
  )
}

/**
 * WardrobeScene — a luxurious bespoke gentleman's wardrobe.
 * Dual 3D doors swing open on entry to reveal an illuminated wooden closet
 * with a brushed brass hanging rail, organizer shelves, and lower display compartments.
 */
export function WardrobeScene({ products, intensity }: SceneProps) {
  const { locale } = useApp()
  const isRtl = LOCALE_DIRECTION[locale] === 'rtl'
  const containerRef = useRef<HTMLDivElement>(null)
  const columns = useShelfColumns(containerRef)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [doorsOpen, setDoorsOpen] = useState(false)

  const animated = intensity !== 'low'
  const sections = useMemo(() => partitionWardrobe(products), [products])

  useEffect(() => {
    // Open wardrobe doors on mount
    const timer = setTimeout(() => setDoorsOpen(true), 80)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border-4 border-amber-950/30 bg-[#16110c] shadow-2xl [perspective:1400px]"
    >
      {/* Wardrobe Back Interior Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_25%,rgba(212,175,55,0.12),transparent_70%)]"
        aria-hidden="true"
      />

      {/* Wardrobe Doors (3D swing on entry) */}
      {animated && (
        <>
          {/* Left Door */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-0 z-30 w-1/2 border-e border-amber-950/70 bg-gradient-to-b from-[#291f16] via-[#1c150e] to-[#120d09] shadow-2xl"
            style={{
              transformOrigin: isRtl ? 'right center' : 'left center',
              backfaceVisibility: 'hidden',
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: doorsOpen ? (isRtl ? 104 : -104) : 0 }}
            transition={DOOR_SPRING}
          >
            {/* Door Panel Bevel Wood Carving */}
            <div className="absolute inset-4 rounded border border-amber-600/20 bg-black/10" />
            {/* Brass Handle */}
            <div className="absolute end-3 top-1/2 -translate-y-1/2 h-16 w-1.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-md" />
          </motion.div>

          {/* Right Door */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 end-0 z-30 w-1/2 border-s border-amber-950/70 bg-gradient-to-b from-[#291f16] via-[#1c150e] to-[#120d09] shadow-2xl"
            style={{
              transformOrigin: isRtl ? 'left center' : 'right center',
              backfaceVisibility: 'hidden',
            }}
            initial={{ rotateY: 0 }}
            animate={{ rotateY: doorsOpen ? (isRtl ? -104 : 104) : 0 }}
            transition={DOOR_SPRING}
          >
            <div className="absolute inset-4 rounded border border-amber-600/20 bg-black/10" />
            <div className="absolute start-3 top-1/2 -translate-y-1/2 h-16 w-1.5 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 shadow-md" />
          </motion.div>
        </>
      )}

      {/* Wardrobe Interior Content */}
      <div className="relative z-10 p-5 sm:p-8 space-y-10">
        {/* Top Section: Hanging Rod */}
        {sections.hanging.length > 0 && (
          <section aria-label="Hanging collection" className="relative">
            {/* Brushed Brass Hanging Rod */}
            <div className="relative flex items-center justify-between">
              <span className="h-5 w-2 rounded bg-amber-600 shadow" aria-hidden="true" />
              <div
                className="h-2.5 w-full bg-gradient-to-r from-amber-700 via-amber-300 to-amber-700 shadow-[0_2px_8px_rgba(251,191,36,0.35)]"
                aria-hidden="true"
              />
              <span className="h-5 w-2 rounded bg-amber-600 shadow" aria-hidden="true" />
            </div>

            {/* Garments on Rail */}
            <div className="mt-2 flex gap-4 overflow-x-auto pb-4 pt-1 sm:gap-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {sections.hanging.map((item, idx) => (
                <WardrobeItem
                  key={item._id}
                  product={item}
                  index={idx}
                  variant="hanger"
                  animated={animated}
                  onOpen={setSelectedProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Middle Section: Folded / Compartment Shelves */}
        {sections.shelved.length > 0 && (
          <section aria-label="Folded & accessory shelves" className="relative">
            {/* Shelf Divider Board */}
            <div className="h-3 w-full rounded-sm border-t border-amber-500/40 bg-gradient-to-b from-[#3a291a] to-[#22180f] shadow-md" />

            <div
              className="mt-4 grid gap-4 sm:gap-5"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {sections.shelved.map((item, idx) => (
                <WardrobeItem
                  key={item._id}
                  product={item}
                  index={idx}
                  variant="folded"
                  animated={animated}
                  onOpen={setSelectedProduct}
                />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Tier: Shoes & Leather goods */}
        {sections.bottom.length > 0 && (
          <section aria-label="Footwear and bottom compartment" className="relative pt-2">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px flex-1 bg-amber-600/30" />
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-gold/70">
                L'Atelier
              </span>
              <span className="h-px flex-1 bg-amber-600/30" />
            </div>

            <div
              className="grid gap-4 sm:gap-5"
              style={{ gridTemplateColumns: `repeat(${Math.min(4, columns + 1)}, minmax(0, 1fr))` }}
            >
              {sections.bottom.map((item, idx) => (
                <WardrobeItem
                  key={item._id}
                  product={item}
                  index={idx}
                  variant="shoe"
                  animated={animated}
                  onOpen={setSelectedProduct}
                />
              ))}
            </div>

            {/* Bottom Baseboard */}
            <div className="mt-5 h-4 w-full rounded-b border-t border-amber-600/30 bg-gradient-to-b from-[#2a1d12] to-[#140e08]" />
          </section>
        )}
      </div>

      {/* Shared in-scene detail card */}
      <AnimatePresence>
        {selectedProduct && (
          <SceneDetailCard product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

