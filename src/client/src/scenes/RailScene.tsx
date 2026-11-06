import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion'
import type { MotionValue, PanInfo } from 'framer-motion'
import { LOCALE_DIRECTION } from '@shared/constants/locales'
import { useApp } from '../app/useApp'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneIntensity, SceneProps } from './sceneIntensity'

const SNAP_SPRING = { type: 'spring', stiffness: 300, damping: 34, mass: 0.7 } as const
const SWING_SPRING = { type: 'spring', stiffness: 90, damping: 11, mass: 0.8 } as const

interface HangerProps {
  product: Product
  index: number
  intensity: SceneIntensity
  swing: MotionValue<number>
  onOpen: (product: Product) => void
}

/** A single garment on the rail: hook, image card and price, pivoting from the hook. */
function Hanger({ product, index, intensity, swing, onOpen }: HangerProps) {
  const { t, locale } = useApp()
  const image = primaryImage(product)
  const name = pickText(product.name, locale)
  const animated = intensity !== 'low'

  // Alternate the swing direction and strength per hanger for a lifelike ripple.
  const factor = (index % 2 === 0 ? 1 : -1) * (0.5 + (index % 3) * 0.2)
  const rotate = useTransform(swing, (value) => (animated ? value * factor : 0))

  return (
    <motion.div
      className="flex w-36 shrink-0 flex-col items-center sm:w-44"
      style={{ rotate, transformOrigin: 'top center' }}
      initial={animated ? { opacity: 0, y: 24 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: 'easeOut' }}
    >
      <span aria-hidden="true" className="h-7 w-px bg-line" />
      <span aria-hidden="true" className="mb-1 h-1.5 w-6 rounded-full border border-line" />

      <button
        type="button"
        onClick={() => onOpen(product)}
        className="group relative block w-full overflow-hidden rounded-brand border border-line bg-cream-card text-start shadow-sm transition-transform duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-none"
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

        <div className="p-3">
          <p className="font-display text-sm text-ink">{name}</p>
          <p className="mt-0.5 font-sans text-xs text-ink/70">
            {formatPrice(product.price, product.currency)}
          </p>
        </div>
      </button>
    </motion.div>
  )
}

/**
 * Horizontal hanger rail with inertia, item snap and pendulum swing.
 * Tapping a hanger lifts it into an in-scene detail card.
 * @see docs/DISPLAY_SYSTEM.md
 */
export function RailScene({ products, intensity }: SceneProps) {
  const { locale } = useApp()
  const rtl = LOCALE_DIRECTION[locale] === 'rtl'
  const animated = intensity !== 'low'
  const shadowDepth = intensity === 'medium' || intensity === 'high'

  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const swing = useMotionValue(0)
  const snapAnimation = useRef<{ stop: () => void } | null>(null)
  const swingAnimation = useRef<{ stop: () => void } | null>(null)
  const dragged = useRef(false)

  const [metrics, setMetrics] = useState({ step: 0, maxDrag: 0 })
  const [active, setActive] = useState<Product | null>(null)

  const shadowX = useTransform(x, (value) => (shadowDepth ? value * 0.06 : 0))

  // Measure item spacing and overflow so the track can snap and stay bounded.
  useLayoutEffect(() => {
    const container = containerRef.current
    const track = trackRef.current
    if (!container || !track) return

    const measure = () => {
      const items = Array.from(track.children) as HTMLElement[]
      const first = items[0]
      const second = items[1]
      const step = first
        ? Math.abs((second?.offsetLeft ?? first.offsetLeft + first.offsetWidth + 24) - first.offsetLeft)
        : 0
      setMetrics({ step, maxDrag: Math.max(0, track.scrollWidth - container.clientWidth) })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    observer.observe(track)
    return () => observer.disconnect()
  }, [products])

  useEffect(
    () => () => {
      snapAnimation.current?.stop()
      swingAnimation.current?.stop()
    },
    [],
  )

  // Sign flips with reading direction so dragging always reveals new items.
  const sign = rtl ? 1 : -1
  const minX = rtl ? 0 : -metrics.maxDrag
  const maxX = rtl ? metrics.maxDrag : 0

  function handleDrag(_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    dragged.current = true
    swingAnimation.current?.stop()
    if (animated) {
      swing.set(Math.max(-14, Math.min(14, info.velocity.x * 0.08)))
    }
  }

  function handleDragEnd() {
    if (animated) {
      swingAnimation.current = animate(swing, 0, SWING_SPRING)
    } else {
      swing.set(0)
    }

    if (metrics.step > 0) {
      const index = Math.max(0, Math.round(x.get() / (sign * metrics.step)))
      const target = Math.min(maxX, Math.max(minX, sign * index * metrics.step))
      snapAnimation.current?.stop()
      snapAnimation.current = animate(x, target, SNAP_SPRING)
    }

    window.setTimeout(() => {
      dragged.current = false
    }, 0)
  }

  return (
    <div className="relative">
      {/* Soft wall shadow that shifts with the rail's scroll depth */}
      <motion.div
        aria-hidden="true"
        style={{ x: shadowX }}
        className="pointer-events-none absolute inset-x-6 -top-3 h-24 rounded-[50%] bg-black/5 blur-2xl dark:bg-black/40"
      />

      {/* Rail bar */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-6 h-px bg-line" />

      <div
        ref={containerRef}
        className="relative cursor-grab overflow-hidden pt-6 active:cursor-grabbing"
      >
        <motion.div
          ref={trackRef}
          className="flex w-max gap-6 ps-1 pe-1"
          style={{ x }}
          drag="x"
          dragConstraints={{ left: minX, right: maxX }}
          dragElastic={0.05}
          dragMomentum={false}
          onDragStart={() => {
            dragged.current = false
            snapAnimation.current?.stop()
          }}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        >
          {products.map((product, index) => (
            <Hanger
              key={product._id}
              product={product}
              index={index}
              intensity={intensity}
              swing={swing}
              onOpen={(item) => {
                if (!dragged.current) setActive(item)
              }}
            />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {active && <SceneDetailCard product={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
