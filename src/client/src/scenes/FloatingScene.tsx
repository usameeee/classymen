import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../app/useApp'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

interface FloatingItemProps {
  product: Product
  index: number
  animated: boolean
  onOpen: (product: Product) => void
}

/**
 * A single floating item: suspended in space with a gentle sine bob,
 * a dynamic contact shadow below that softens as it rises, and drag-tilt.
 */
function FloatingItem({ product, index, animated, onOpen }: FloatingItemProps) {
  const { locale } = useApp()
  const image = primaryImage(product)
  const name = pickText(product.name, locale)

  // Desynchronize the floating periods and offsets for natural movement
  const duration = 3.5 + (index % 4) * 0.7
  const delay = (index % 3) * 0.4
  const bobDistance = 14 + (index % 3) * 4

  return (
    <div className="relative flex flex-col items-center">
      {/* Levitating product card */}
      <motion.div
        className="relative z-10 w-full"
        animate={
          animated
            ? {
                y: [0, -bobDistance, 0],
                rotateZ: [0, (index % 2 === 0 ? 1.5 : -1.5), 0],
              }
            : { y: 0, rotateZ: 0 }
        }
        transition={
          animated
            ? {
                duration,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
        whileHover={{ scale: 1.04, y: -bobDistance - 6 }}
        whileTap={{ scale: 0.98 }}
      >
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="group relative block w-full overflow-hidden rounded-2xl border border-gold/30 bg-cream-card/90 p-3.5 text-start shadow-xl backdrop-blur-sm transition-colors duration-300 hover:border-gold hover:shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold dark:bg-[#18130e]/90"
        >
          {/* Subtle luminous ambient aura inside card */}
          <div
            className="pointer-events-none absolute -end-10 -top-10 h-28 w-28 rounded-full bg-gold/15 blur-2xl transition-opacity group-hover:bg-gold/25"
            aria-hidden="true"
          />

          <div className="relative aspect-square overflow-hidden rounded-xl bg-ink/5 dark:bg-cream/5">
            {image ? (
              <img
                src={image.url}
                alt={image.alt ?? name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="font-display text-4xl text-gold/30">{name.charAt(0)}</span>
              </div>
            )}

            {/* Depth sheen reflection */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:via-white/5" />
          </div>

          <div className="mt-3.5 px-1">
            <h3 className="line-clamp-1 font-display text-base font-medium text-ink transition-colors group-hover:text-gold">
              {name}
            </h3>
            <div className="mt-1 flex items-center justify-between">
              <p className="font-sans text-xs font-semibold text-gold">
                {formatPrice(product.price, product.currency)}
              </p>
              <span className="font-sans text-[11px] text-ink/40 transition-colors group-hover:text-gold/80">
                ↗
              </span>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Floating Ground Shadow: stretches & softens synchronously */}
      <motion.div
        aria-hidden="true"
        className="mt-3 h-3 w-3/4 rounded-full bg-gradient-to-r from-transparent via-ink/20 to-transparent blur-md dark:via-black/60"
        animate={
          animated
            ? {
                scale: [1, 0.78, 1],
                opacity: [0.6, 0.25, 0.6],
              }
            : { scale: 1, opacity: 0.5 }
        }
        transition={
          animated
            ? {
                duration,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
      />
    </div>
  )
}

/**
 * FloatingScene — A zero-gravity showcase where items float at various depths
 * with gentle sine bobs, responsive shadows, and luminous ambient reflections.
 */
export function FloatingScene({ products, intensity }: SceneProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const animated = intensity !== 'low'

  return (
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-cream/60 via-cream-card/30 to-cream/80 p-6 sm:p-12 dark:from-[#140f0a] dark:via-[#18120c] dark:to-[#0f0b07]">
      {/* Background ambient starry particles / lighting aura */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.08),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-10">
        {products.map((product, index) => (
          <FloatingItem
            key={product._id}
            product={product}
            index={index}
            animated={animated}
            onOpen={setSelectedProduct}
          />
        ))}
      </div>

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
