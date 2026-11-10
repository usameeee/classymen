/**
 * DressingRoomModal — Virtual Dressing Room (Sanal Giyinme Odası)
 *
 * Lets the customer compose a complete look by picking:
 *   - A garment  (tradition / pret-a-porter categories → mannequin | wardrobe | rail)
 *   - Shoes      (chaussures subcategory)
 *   - A scent    (parfums subcategory)
 *
 * Selected pieces are shown as a styled "look board" and can be added to the
 * cart in a single action.
 */
import { useEffect, useId, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../app/useApp'
import { useCart } from '../../app/useCart'
import { fetchProducts } from '../../lib/catalog'
import type { Product } from '../../lib/catalog'
import { pickText } from '../../lib/localized'
import { formatPrice, primaryImage } from '../catalog/ProductCard'

// Category slugs we query per slot
const SLOT_CATEGORIES: Record<Slot, string[]> = {
  top: ['daraa', 'azbi', 'chemises', 'polos', 'costumes', 'manches-longues'],
  shoes: ['chaussures'],
  scent: ['parfums', 'parfums-de-niche', 'bakhoor'],
}

type Slot = 'top' | 'shoes' | 'scent'

const SLOT_KEYS: Slot[] = ['top', 'shoes', 'scent']

interface SlotData {
  products: Product[]
  loading: boolean
}

interface DressingRoomModalProps {
  onClose: () => void
}

export function DressingRoomModal({ onClose }: DressingRoomModalProps) {
  const { t, locale } = useApp()
  const { add } = useCart()
  const backdropId = useId()

  const [activeSlot, setActiveSlot] = useState<Slot>('top')
  const [slots, setSlots] = useState<Record<Slot, SlotData>>({
    top: { products: [], loading: true },
    shoes: { products: [], loading: true },
    scent: { products: [], loading: true },
  })
  const [selected, setSelected] = useState<Partial<Record<Slot, Product>>>({})
  const [addedAll, setAddedAll] = useState(false)

  // Fetch each slot in parallel
  useEffect(() => {
    SLOT_KEYS.forEach((slot) => {
      const categorySlug = SLOT_CATEGORIES[slot][0] // primary slug
      fetchProducts({ category: categorySlug, limit: 20 })
        .then((page) => {
          setSlots((prev) => ({
            ...prev,
            [slot]: { products: page.items, loading: false },
          }))
        })
        .catch(() => {
          setSlots((prev) => ({ ...prev, [slot]: { products: [], loading: false } }))
        })
    })
  }, [])

  // Keyboard ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  function pickProduct(slot: Slot, product: Product) {
    setSelected((prev) =>
      prev[slot]?._id === product._id ? { ...prev, [slot]: undefined } : { ...prev, [slot]: product },
    )
    setAddedAll(false)
  }

  function handleAddAll() {
    const picks = Object.values(selected).filter(Boolean) as Product[]
    if (!picks.length) return
    picks.forEach((p) => {
      const img = primaryImage(p)
      add({
        productId: p._id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        currency: p.currency,
        image: img?.url,
        size: p.sizes[0],
      })
    })
    setAddedAll(true)
  }

  const pickCount = Object.values(selected).filter(Boolean).length
  const totalPrice = (Object.values(selected).filter(Boolean) as Product[]).reduce(
    (sum, p) => sum + p.price,
    0,
  )

  const slotLabel: Record<Slot, string> = {
    top: t('dressing.top'),
    shoes: t('dressing.shoes'),
    scent: t('dressing.scent'),
  }

  const slotIcon: Record<Slot, string> = { top: 'I', shoes: 'II', scent: 'III' }

  return (
    <AnimatePresence>
      <motion.div
        key="dressing-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => {
          if ((e.target as HTMLElement).id === backdropId) onClose()
        }}
        id={backdropId}
      >
        <motion.div
          className="relative mx-4 flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-brand border border-line bg-cream-card shadow-2xl"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <div>
              <h2 className="font-display text-xl text-ink">{t('dressing.title')}</h2>
              <p className="mt-0.5 font-sans text-xs text-ink/50">{t('dressing.subtitle')}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('menu.close')}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink/50 transition-colors hover:bg-line hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left: slot tabs + product grid */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Slot tabs */}
              <div className="flex border-b border-line">
                {SLOT_KEYS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setActiveSlot(slot)}
                    className={`flex flex-1 flex-col items-center gap-1 px-3 py-3 font-sans text-xs uppercase tracking-[0.15em] transition-colors ${
                      activeSlot === slot
                        ? 'border-b-2 border-gold text-gold'
                        : 'text-ink/50 hover:text-ink'
                    }`}
                  >
                    <span className="font-serif text-xs font-bold text-gold">{slotIcon[slot]}</span>
                    <span>{slotLabel[slot]}</span>
                    {selected[slot] && (
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    )}
                  </button>
                ))}
              </div>

              {/* Product grid */}
              <div className="flex-1 overflow-y-auto p-4">
                {slots[activeSlot].loading ? (
                  <div className="flex h-40 items-center justify-center">
                    <p className="font-sans text-xs text-ink/40">{t('common.loading')}</p>
                  </div>
                ) : slots[activeSlot].products.length === 0 ? (
                  <div className="flex h-40 items-center justify-center">
                    <p className="font-sans text-xs text-ink/40">{t('dressing.empty')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {slots[activeSlot].products.map((product) => {
                      const img = primaryImage(product)
                      const isChosen = selected[activeSlot]?._id === product._id
                      return (
                        <motion.button
                          key={product._id}
                          type="button"
                          onClick={() => pickProduct(activeSlot, product)}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.97 }}
                          className={`group flex flex-col overflow-hidden rounded-brand border transition-colors ${
                            isChosen
                              ? 'border-gold ring-1 ring-gold'
                              : 'border-line hover:border-gold'
                          }`}
                        >
                          <div className="aspect-square overflow-hidden bg-line/30">
                            {img ? (
                              <img
                                src={img.url}
                                alt={img.alt ?? pickText(product.name, locale)}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <span className="font-display text-3xl text-gold/30">
                                  {pickText(product.name, locale).charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-2 text-start">
                            <p className="line-clamp-1 font-sans text-xs text-ink">
                              {pickText(product.name, locale)}
                            </p>
                            <p className="mt-0.5 font-sans text-xs text-gold">
                              {formatPrice(product.price, product.currency)}
                            </p>
                          </div>
                          {isChosen && (
                            <div className="bg-gold px-2 py-0.5 text-center font-sans text-[10px] uppercase tracking-[0.15em] text-cream-card">
                              ✓
                            </div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right: look board */}
            <div className="hidden w-56 flex-col border-s border-line md:flex">
              <div className="border-b border-line px-4 py-3">
                <p className="font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
                  {t('dressing.complete')}
                </p>
              </div>
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
                {SLOT_KEYS.map((slot) => {
                  const pick = selected[slot]
                  const img = pick ? primaryImage(pick) : null
                  return (
                    <div key={slot} className="flex flex-col gap-1">
                      <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-ink/40">
                        {slotLabel[slot]}
                      </span>
                      {pick ? (
                        <div className="group relative flex items-center gap-2 rounded-brand border border-gold p-2">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-brand bg-line/30">
                            {img && <img src={img.url} alt="" className="h-full w-full object-cover" />}
                          </div>
                          <p className="line-clamp-2 flex-1 font-sans text-xs text-ink">
                            {pickText(pick.name, locale)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelected((p) => ({ ...p, [slot]: undefined }))}
                            className="absolute end-1 top-1 text-[10px] text-ink/30 hover:text-gold"
                            aria-label={t('cart.remove')}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex h-14 items-center justify-center rounded-brand border border-dashed border-line">
                          <span className="font-sans text-[10px] text-ink/30">{t('dressing.empty')}</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Add all to cart */}
              {pickCount > 0 && (
                <div className="border-t border-line p-4">
                  <p className="font-sans text-xs text-ink/60">
                    {pickCount} {pickCount === 1 ? 'pièce' : 'pièces'} ·{' '}
                    {formatPrice(totalPrice, (Object.values(selected).find(Boolean) as Product | undefined)?.currency ?? 'MRU')}
                  </p>
                  <motion.button
                    type="button"
                    onClick={handleAddAll}
                    whileTap={{ scale: 0.97 }}
                    className="mt-2 w-full rounded-brand bg-gold px-3 py-2 font-sans text-xs uppercase tracking-[0.15em] text-cream-card transition-colors hover:bg-gold-dark"
                  >
                    {addedAll ? '✓ ' : ''}
                    {t('dressing.addAll')}
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile bottom bar: add all */}
          {pickCount > 0 && (
            <div className="border-t border-line p-4 md:hidden">
              <div className="flex items-center justify-between">
                <p className="font-sans text-xs text-ink/60">
                  {pickCount} · {formatPrice(totalPrice, (Object.values(selected).find(Boolean) as Product | undefined)?.currency ?? 'MRU')}
                </p>
                <button
                  type="button"
                  onClick={handleAddAll}
                  className="rounded-brand bg-gold px-5 py-2 font-sans text-xs uppercase tracking-[0.15em] text-cream-card hover:bg-gold-dark"
                >
                  {addedAll ? '✓ ' : ''}
                  {t('dressing.addAll')}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

