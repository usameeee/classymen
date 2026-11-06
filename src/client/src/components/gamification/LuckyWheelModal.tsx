import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../app/useApp'

interface Prize {
  label: string
  code: string
  color: string
  textColor: string
}

const PRIZES: Prize[] = [
  { label: '10% OFF', code: 'WELCOME10', color: '#1a1611', textColor: '#d4af37' },
  { label: '200 MRU', code: 'MRU200', color: '#262018', textColor: '#f7f4ef' },
  { label: '5% OFF', code: 'CLASSY5', color: '#b8973e', textColor: '#1a1611' },
  { label: '15% VIP', code: 'VIP15', color: '#1a1611', textColor: '#d4af37' },
  { label: '5% OFF', code: 'CLASSY5', color: '#262018', textColor: '#f7f4ef' },
  { label: '10% OFF', code: 'WELCOME10', color: '#b8973e', textColor: '#1a1611' },
]

const SPIN_STORAGE_KEY = 'cmr:wheel_last_spin'
const SAVED_COUPON_KEY = 'cmr:coupon'

export function LuckyWheelModal({ onClose }: { onClose: () => void }) {
  const { t } = useApp()
  const backdropId = useId()

  const todayStr = new Date().toISOString().split('T')[0]
  const lastSpin = localStorage.getItem(SPIN_STORAGE_KEY)
  const alreadyPlayed = lastSpin === todayStr

  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [wonPrize, setWonPrize] = useState<Prize | null>(null)

  function handleSpin() {
    if (spinning || alreadyPlayed) return

    setSpinning(true)
    const prizeIndex = Math.floor(Math.random() * PRIZES.length)
    const segmentAngle = 360 / PRIZES.length
    // Extra rotations for tension (e.g. 5 full rounds + offset to sector center)
    const totalRounds = 5 * 360
    // Invert angle for pointer at top (270deg offset)
    const targetAngle = totalRounds + (360 - (prizeIndex * segmentAngle + segmentAngle / 2))

    setRotation(targetAngle)

    setTimeout(() => {
      const selected = PRIZES[prizeIndex]
      setWonPrize(selected)
      setSpinning(false)
      localStorage.setItem(SPIN_STORAGE_KEY, todayStr)
      localStorage.setItem(SAVED_COUPON_KEY, selected.code)
    }, 4500)
  }

  const segmentAngle = 360 / PRIZES.length

  return (
    <div
      id={backdropId}
      onClick={(e) => {
        if ((e.target as HTMLElement).id === backdropId && !spinning) onClose()
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md overflow-hidden rounded-brand border border-gold/40 bg-cream-card p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          disabled={spinning}
          aria-label={t('menu.close')}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-ink/60 transition-colors hover:bg-line hover:text-ink disabled:opacity-30"
        >
          ✕
        </button>

        <div className="text-center">
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-gold">
            {t('wheel.badge')}
          </p>
          <h2 className="mt-1 font-display text-2xl text-ink">{t('wheel.title')}</h2>
          <p className="mt-1 font-sans text-xs text-ink/60">{t('wheel.subtitle')}</p>
        </div>

        {/* Wheel Graphic */}
        <div className="relative mx-auto my-6 flex h-64 w-64 items-center justify-center">
          {/* Top Pointer */}
          <div className="absolute -top-3 z-20 flex flex-col items-center">
            <div className="h-0 w-0 border-x-8 border-t-[14px] border-x-transparent border-t-gold filter drop-shadow" />
          </div>

          {/* Rotating Wheel Plate */}
          <motion.div
            style={{ rotate: rotation }}
            transition={{ duration: 4.5, ease: [0.15, 0.9, 0.2, 1] }}
            className="relative h-60 w-60 overflow-hidden rounded-full border-4 border-gold shadow-lg"
          >
            {PRIZES.map((p, idx) => {
              const startAngle = idx * segmentAngle
              return (
                <div
                  key={idx}
                  style={{
                    transform: `rotate(${startAngle}deg)`,
                    transformOrigin: '50% 50%',
                    backgroundColor: p.color,
                    clipPath: 'polygon(50% 50%, 0 0, 100% 0)',
                  }}
                  className="absolute inset-0 flex items-start justify-center pt-3 text-center"
                >
                  <span
                    style={{ color: p.textColor }}
                    className="font-sans text-[11px] font-bold uppercase tracking-wider"
                  >
                    {p.label}
                  </span>
                </div>
              )
            })}
          </motion.div>

          {/* Center Hub */}
          <div className="absolute z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold bg-cream-card shadow">
            <span className="font-display text-sm font-bold text-gold">CMR</span>
          </div>
        </div>

        {/* State actions */}
        <div className="text-center">
          <AnimatePresence mode="wait">
            {wonPrize ? (
              <motion.div
                key="won"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-brand border border-gold/40 bg-gold/10 p-4"
              >
                <h3 className="font-display text-lg text-ink">{t('wheel.wonTitle')}</h3>
                <p className="mt-1 font-sans text-xs text-ink/70">{t('wheel.wonDesc')}</p>
                <div className="my-2 inline-block rounded-brand bg-gold px-4 py-1.5 font-sans text-sm font-bold tracking-widest text-cream-card">
                  {wonPrize.code} ({wonPrize.label})
                </div>
                <div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 font-sans text-xs uppercase tracking-[0.15em] text-gold underline hover:text-gold-dark"
                  >
                    {t('wheel.useNow')}
                  </button>
                </div>
              </motion.div>
            ) : alreadyPlayed ? (
              <div key="already-played" className="p-2">
                <p className="font-sans text-xs text-ink/60">{t('wheel.alreadyPlayed')}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 inline-block rounded-brand border border-line px-5 py-2 font-sans text-xs uppercase tracking-[0.15em] text-ink/80 transition-colors hover:border-gold hover:text-gold"
                >
                  {t('menu.close')}
                </button>
              </div>
            ) : (
              <button
                key="spin-btn"
                type="button"
                onClick={handleSpin}
                disabled={spinning}
                className="w-full rounded-brand bg-gold py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow-md transition-colors hover:bg-gold-dark disabled:opacity-60"
              >
                {spinning ? t('wheel.spinning') : t('wheel.spin')}
              </button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

