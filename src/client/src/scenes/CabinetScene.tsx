import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../app/useApp'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

const ITEM_SPRING = { type: 'spring', stiffness: 260, damping: 26, mass: 0.7 } as const
const DOOR_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Bucket `products` into rows of `size` so each row gets its own shelf board. */
function toRows(products: Product[], size: number): Product[][] {
  const rows: Product[][] = []
  for (let index = 0; index < products.length; index += size) {
    rows.push(products.slice(index, index + size))
  }
  return rows
}

/** Responsive column count, measured so shelf boards align with their items. */
function useColumnCount(ref: RefObject<HTMLElement | null>): number {
  const [columns, setColumns] = useState(3)

  useLayoutEffect(() => {
    const element = ref.current
    if (!element) return

    const measure = () => {
      const width = element.clientWidth
      setColumns(width < 480 ? 2 : width < 768 ? 3 : 4)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return columns
}

interface CabinetItemProps {
  product: Product
  index: number
  animated: boolean
  focused: boolean
  dimmed: boolean
  onOpen: (product: Product) => void
  onHover: (id: string | null) => void
}

/** One item resting on a shelf: rises in on scroll, scales up on focus. */
function CabinetItem({
  product,
  index,
  animated,
  focused,
  dimmed,
  onOpen,
  onHover,
}: CabinetItemProps) {
  const { t, locale } = useApp()
  const image = primaryImage(product)
  const name = pickText(product.name, locale)

  return (
    <motion.div
      initial={animated ? { opacity: 0, y: 28 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ delay: (index % 4) * 0.06, duration: 0.45, ease: 'easeOut' }}
    >
      <motion.button
        type="button"
        onClick={() => onOpen(product)}
        onMouseEnter={() => onHover(product._id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(product._id)}
        onBlur={() => onHover(null)}
        animate={{ scale: focused ? 1.05 : 1, y: focused ? -6 : 0, opacity: dimmed ? 0.45 : 1 }}
        transition={ITEM_SPRING}
        className="relative block w-full overflow-hidden rounded-brand border border-line bg-cream-card text-start shadow-md focus-visible:outline-none"
        style={{ transformOrigin: 'bottom center' }}
      >
        <div className="relative aspect-[3/4] overflow-hidden">
          {image ? (
            <img
              src={image.url}
              alt={image.alt ?? name}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-display text-4xl text-gold/30">{name.charAt(0)}</span>
            </div>
          )}

          {product.isMadeToMeasure && (
            <span className="absolute start-2 top-2 rounded-brand bg-cream-card/90 px-2 py-1 font-sans text-[10px] uppercase tracking-[0.2em] text-gold">
              {t('product.measure')}
            </span>
          )}
        </div>

        <div className="p-2.5">
          <p className="truncate font-display text-sm text-ink">{name}</p>
          <p className="mt-0.5 font-sans text-xs text-ink/70">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </motion.button>
    </motion.div>
  )
}

/**
 * Cabinet scene: a warm-lit wooden cabinet with glass reflection and swinging
 * doors on entry. Items auto-arrange onto shelves, rise in on scroll, and scale
 * up (dimming their siblings) on focus; tapping one opens the in-scene card.
 * @see docs/DISPLAY_SYSTEM.md
 */
export function CabinetScene({ products, intensity }: SceneProps) {
  const cabinetRef = useRef<HTMLDivElement>(null)
  const columns = useColumnCount(cabinetRef)
  const rows = useMemo(() => toRows(products, columns), [products, columns])

  const animated = intensity !== 'low'
  const focusEnabled = intensity === 'high'

  const [doorsOpen, setDoorsOpen] = useState(!animated)
  const [hovered, setHovered] = useState<string | null>(null)
  const [active, setActive] = useState<Product | null>(null)

  // Swing the doors open shortly after mount (skipped when motion is reduced).
  useEffect(() => {
    if (!animated) return
    const id = window.setTimeout(() => setDoorsOpen(true), 300)
    return () => window.clearTimeout(id)
  }, [animated])

  return (
    <div className="relative">
      <div
        ref={cabinetRef}
        className="relative overflow-hidden rounded-brand border-[10px] border-[#5b3f22] bg-[linear-gradient(to_bottom,#f7ecd8,#e2cfae)] p-4 shadow-[inset_0_2px_18px_rgba(0,0,0,0.18)] sm:p-6 dark:border-[#33240f] dark:bg-[linear-gradient(to_bottom,#241b10,#150f08)]"
      >
        {/* Warm interior light */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(ellipse_at_top,rgba(201,154,82,0.35),transparent_70%)]"
        />

        <div className="relative space-y-6">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex}>
              <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              >
                {row.map((product, itemIndex) => (
                  <CabinetItem
                    key={product._id}
                    product={product}
                    index={itemIndex}
                    animated={animated}
                    focused={focusEnabled && hovered === product._id}
                    dimmed={focusEnabled && hovered !== null && hovered !== product._id}
                    onOpen={setActive}
                    onHover={setHovered}
                  />
                ))}
              </div>

              {/* Shelf board beneath the row */}
              <div
                aria-hidden="true"
                className="mt-3 h-2 rounded-full bg-[linear-gradient(to_bottom,#7a5426,#4a3115)] shadow-[0_2px_6px_rgba(0,0,0,0.25)] dark:bg-[linear-gradient(to_bottom,#5c3f1c,#2c1e0e)]"
              />
            </div>
          ))}
        </div>

        {/* Glass reflection */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.28),transparent_35%)] dark:bg-[linear-gradient(115deg,rgba(255,255,255,0.06),transparent_35%)]"
        />
      </div>

      {/* Cabinet doors that swing open on entry */}
      {animated && (
        <div className="pointer-events-none absolute inset-0" style={{ perspective: 1400 }}>
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1/2 border-r border-black/25 bg-[linear-gradient(160deg,#6b4a26,#3d2911)]"
            style={{ backfaceVisibility: 'hidden' }}
            initial={{ rotateY: 0, opacity: 1 }}
            animate={{ rotateY: doorsOpen ? -105 : 0, opacity: doorsOpen ? 0 : 1 }}
            transition={{
              rotateY: { duration: 0.9, ease: DOOR_EASE },
              opacity: { duration: 0.9, ease: 'easeIn', delay: 0.35 },
            }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 w-1/2 border-l border-black/25 bg-[linear-gradient(200deg,#6b4a26,#3d2911)]"
            style={{ backfaceVisibility: 'hidden' }}
            initial={{ rotateY: 0, opacity: 1 }}
            animate={{ rotateY: doorsOpen ? 105 : 0, opacity: doorsOpen ? 0 : 1 }}
            transition={{
              rotateY: { duration: 0.9, ease: DOOR_EASE },
              opacity: { duration: 0.9, ease: 'easeIn', delay: 0.35 },
            }}
          />
        </div>
      )}

      <AnimatePresence>
        {active && <SceneDetailCard product={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
