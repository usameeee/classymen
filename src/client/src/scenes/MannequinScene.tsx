import { useCallback, useId, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { LOCALE_DIRECTION } from '@shared/constants/locales'
import { useApp } from '../app/useApp'
import { formatPrice, primaryImage } from '../components/catalog/ProductCard'
import type { Product } from '../lib/catalog'
import { pickText } from '../lib/localized'
import { SceneDetailCard } from './SceneDetailCard'
import type { SceneProps } from './sceneIntensity'

/** Numbered pulse rings over the figure; each opens the in-scene detail card. */
const HOTSPOTS = [
  { top: '18%', left: '50%' },
  { top: '42%', left: '28%' },
  { top: '68%', left: '68%' },
]

const TURN_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const FIGURE_PATH =
  'M100 40 C76 40 63 57 57 78 C50 100 45 132 43 164 C41 200 47 238 53 270 L147 270 C153 238 159 200 157 164 C155 132 150 100 143 78 C137 57 124 40 100 40 Z'

interface MannequinFigureProps {
  product: Product
  animated: boolean
  zoomed: boolean
  onOpen: () => void
}

/** Faceless mannequin: the garment photo is clipped into the torso silhouette. */
function MannequinFigure({ product, animated, zoomed, onOpen }: MannequinFigureProps) {
  const { locale } = useApp()
  const image = primaryImage(product)
  const name = pickText(product.name, locale)
  const uid = useId().replace(/:/g, '')

  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 200 340" className="h-full w-full" role="img" aria-label={name}>
        <defs>
          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e2d6c0" />
            <stop offset="55%" stopColor="#c8b79c" />
            <stop offset="100%" stopColor="#a99878" />
          </linearGradient>
          <clipPath id={`torso-${uid}`}>
            <path d={FIGURE_PATH} />
          </clipPath>
        </defs>

        {/* Neck + head + stand */}
        <rect x="91" y="8" width="18" height="36" rx="8" fill={`url(#body-${uid})`} />
        <ellipse cx="100" cy="14" rx="15" ry="17" fill={`url(#body-${uid})`} />
        <rect x="96" y="270" width="8" height="42" fill="#8f7f63" />
        <ellipse cx="100" cy="316" rx="36" ry="8" fill="#8f7f63" opacity="0.85" />

        {/* Torso: garment clipped to the silhouette, else the bare form */}
        <g clipPath={`url(#torso-${uid})`}>
          <path d={FIGURE_PATH} fill={`url(#body-${uid})`} />
          {image && (
            <image
              href={image.url}
              x="15"
              y="18"
              width="170"
              height="262"
              preserveAspectRatio="xMidYMid slice"
            />
          )}
          {/* Inner shading for depth */}
          <path
            d={FIGURE_PATH}
            fill="none"
            stroke="rgba(60,45,25,0.25)"
            strokeWidth="2.5"
          />
        </g>
      </svg>

      {/* Hotspots */}
      {HOTSPOTS.map((spot, spotIndex) => (
        <button
          key={spotIndex}
          type="button"
          onClick={onOpen}
          aria-label={name}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ top: spot.top, left: spot.left }}
        >
          <span className="relative flex h-6 w-6 items-center justify-center">
            {animated && (
              <motion.span
                className="absolute inset-0 rounded-full border border-gold"
                animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: spotIndex * 0.4,
                }}
              />
            )}
            <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-gold font-sans text-[10px] font-semibold text-cream-card shadow">
              {spotIndex + 1}
            </span>
          </span>
        </button>
      ))}

      {/* Zoom hint */}
      {zoomed && (
        <span className="pointer-events-none absolute inset-0 rounded-[40%] ring-2 ring-gold/40" />
      )}
    </div>
  )
}

/**
 * Mannequin scene: a spotlight studio with a faceless mannequin wearing the
 * selected piece. Idle breathing sway, pointer tilt (high intensity), swipe or
 * arrows to turn through the pieces, double-tap to zoom, numbered hotspot rings
 * that open the in-scene card. @see docs/DISPLAY_SYSTEM.md
 */
export function MannequinScene({ products, intensity }: SceneProps) {
  const { t, locale } = useApp()
  const rtl = LOCALE_DIRECTION[locale] === 'rtl'
  const animated = intensity !== 'low'
  const tiltEnabled = intensity === 'high'

  const [index, setIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [active, setActive] = useState<Product | null>(null)

  const product = products[Math.min(index, products.length - 1)]
  const stageRef = useRef<HTMLDivElement>(null)
  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)
  const tiltX = useSpring(useTransform(pointerY, [-0.5, 0.5], [6, -6]), {
    stiffness: 120,
    damping: 18,
  })
  const tiltY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 120,
    damping: 18,
  })

  const go = useCallback(
    (delta: number) => {
      setZoomed(false)
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
    const threshold = 60
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

  return (
    <div className="relative">
      {/* Studio stage */}
      <div
        ref={stageRef}
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
        className="relative overflow-hidden rounded-brand bg-[radial-gradient(ellipse_at_50%_18%,#efe4d0,#cbb894_68%,#ac9976)] px-4 pb-10 pt-8 dark:bg-[radial-gradient(ellipse_at_50%_18%,#2c2216,#171208_68%,#0c0905)]"
      >
        {/* Spotlight cone */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[72%] w-[78%] -translate-x-1/2 bg-[linear-gradient(to_bottom,rgba(255,247,232,0.6),transparent)] blur-[3px] [clip-path:polygon(50%_0,100%_100%,0_100%)] dark:bg-[linear-gradient(to_bottom,rgba(255,236,190,0.18),transparent)]"
        />
        {/* Floor shadow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-7 left-1/2 h-7 w-[58%] -translate-x-1/2 rounded-[50%] bg-black/25 blur-md dark:bg-black/55"
        />

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          onDragEnd={onDragEnd}
          className="relative mx-auto h-[360px] w-[236px] cursor-grab touch-pan-y active:cursor-grabbing sm:h-[452px] sm:w-[296px]"
        >
          <motion.div
            className="h-full w-full"
            style={{ transformOrigin: 'bottom center' }}
            animate={animated ? { y: [0, -6, 0], rotate: [-0.5, 0.5, -0.5] } : undefined}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div
              className="h-full w-full"
              style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
              onDoubleClick={() => setZoomed((value) => !value)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={product._id}
                  className="h-full w-full"
                  style={{ transformPerspective: 800 }}
                  initial={{ rotateY: 80, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1, scale: zoomed ? 1.32 : 1 }}
                  exit={{ rotateY: -80, opacity: 0 }}
                  transition={{ duration: 0.44, ease: TURN_EASE }}
                >
                  <MannequinFigure
                    product={product}
                    animated={animated}
                    zoomed={zoomed}
                    onOpen={() => setActive(product)}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Caption */}
      <div className="mt-5 text-center">
        <h3 className="font-display text-lg text-ink">{pickText(product.name, locale)}</h3>
        <p className="mt-0.5 font-sans text-sm text-ink/70">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={t('scene.previous')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-gold hover:text-gold"
        >
          <span aria-hidden="true">{rtl ? '→' : '←'}</span>
        </button>

        <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">
          {index + 1} / {products.length}
        </span>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label={t('scene.next')}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-gold hover:text-gold"
        >
          <span aria-hidden="true">{rtl ? '←' : '→'}</span>
        </button>

        <button
          type="button"
          onClick={() => setZoomed((value) => !value)}
          aria-label={zoomed ? t('scene.zoomOut') : t('scene.zoomIn')}
          className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
        >
          {zoomed ? t('scene.zoomOut') : t('scene.zoomIn')}
        </button>
      </div>

      {/* Look strip */}
      <div className="mt-5 flex snap-x gap-3 overflow-x-auto pb-2">
        {products.map((item, itemIndex) => {
          const image = primaryImage(item)
          return (
            <button
              key={item._id}
              type="button"
              onClick={() => {
                setZoomed(false)
                setIndex(itemIndex)
              }}
              aria-label={pickText(item.name, locale)}
              aria-current={itemIndex === index}
              className={`h-16 w-12 shrink-0 snap-start overflow-hidden rounded-brand border transition-colors ${
                itemIndex === index ? 'border-gold' : 'border-line hover:border-gold/50'
              }`}
            >
              {image ? (
                <img src={image.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center font-display text-sm text-gold/40">
                  {pickText(item.name, locale).charAt(0)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <AnimatePresence>
        {active && <SceneDetailCard product={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  )
}
