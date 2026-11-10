import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../app/useApp'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

const LIFT_SPRING = { type: 'spring', stiffness: 300, damping: 20 } as const

interface ShelfItemProps {
  product: Product
  index: number
  animated: boolean
  onOpen: (product: Product) => void
}

/**
 * A single piece displayed on the open boutique counter with authentic
 * contact shadows and graceful lift on hover/focus.
 */
function ShelfItem({ product, index, animated, onOpen }: ShelfItemProps) {
  const { locale } = useApp()
  const image = primaryImage(product)
  const name = pickText(product.name, locale)

  return (
    <motion.div
      className="group relative flex w-48 shrink-0 flex-col items-center sm:w-56"
      initial={animated ? { opacity: 0, y: 30 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: 'easeOut' }}
    >
      {/* Product Display Card */}
      <motion.button
        type="button"
        onClick={() => onOpen(product)}
        whileHover={animated ? { y: -8, scale: 1.02 } : undefined}
        whileTap={{ scale: 0.98 }}
        transition={LIFT_SPRING}
        className="relative z-10 w-full overflow-hidden rounded-xl border border-line bg-cream-card/95 text-start shadow-md transition-colors duration-300 hover:border-gold hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:bg-[#1a140f]/95"
      >
        {/* Soft showcase spot behind the piece */}
        <div
          className="pointer-events-none absolute -inset-6 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.12),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        <div className="relative aspect-square overflow-hidden bg-ink/5 p-4 dark:bg-cream/5">
          {image ? (
            <img
              src={image.url}
              alt={image.alt ?? name}
              loading="lazy"
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-106"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-4xl text-gold/30">{name.charAt(0)}</span>
            </div>
          )}
        </div>

        <div className="border-t border-line/60 p-3.5">
          <h3 className="line-clamp-1 font-display text-sm font-medium text-ink transition-colors group-hover:text-gold">
            {name}
          </h3>
          <p className="mt-1 font-sans text-xs font-semibold text-gold">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </motion.button>

      {/* Realistic contact shadow on the counter surface */}
      <motion.div
        aria-hidden="true"
        className="mt-2 h-2.5 w-4/5 rounded-full bg-ink/25 blur-sm transition-all duration-300 group-hover:scale-90 group-hover:opacity-40 dark:bg-black/60"
      />
    </motion.div>
  )
}

/**
 * ShelfScene — An open boutique showcase counter (luxury travertine/wood surface).
 * Items feature contact shadows, subtle vertical lift on interaction,
 * and horizontal drag/scroll navigation.
 */
export function ShelfScene({ products, intensity }: SceneProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const animated = intensity !== 'low'

  return (
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-cream/40 via-cream-card/20 to-cream/80 shadow-lg dark:from-[#18120b] dark:via-[#130e08] dark:to-[#0d0905]">
      {/* Counter Header Controls */}
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
          <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/70">
            Showcase Counter
          </span>
        </div>
      </div>

      {/* Horizontal Counter Surface Track (Scroll / Swipe to navigate) */}
      <motion.div
        ref={scrollRef}
        drag="x"
        dragConstraints={{ left: -((products.length - 1) * 220), right: 0 }}
        dragElastic={0.1}
        className="relative flex gap-6 overflow-x-auto px-6 py-10 sm:gap-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing"
      >
        {products.map((product, index) => (
          <ShelfItem
            key={product._id}
            product={product}
            index={index}
            animated={animated}
            onOpen={setSelectedProduct}
          />
        ))}
      </motion.div>

      {/* Solid Counter Base Rim */}
      <div
        className="h-3 w-full border-t border-gold/30 bg-gradient-to-r from-amber-700/40 via-amber-400/60 to-amber-700/40 shadow-inner"
        aria-hidden="true"
      />

      {/* Shared in-scene detail card */}
      <AnimatePresence>
        {selectedProduct && (
          <SceneDetailCard
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
