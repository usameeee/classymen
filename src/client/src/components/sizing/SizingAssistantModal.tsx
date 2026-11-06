import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { calculateDaraaSize } from '@shared/utils/sizing'
import type { FitPreference } from '@shared/utils/sizing'
import { useApp } from '../../app/useApp'

interface SizingAssistantModalProps {
  initialSize?: string
  onClose: () => void
  onSelectSize: (size: string) => void
}

export function SizingAssistantModal({
  initialSize,
  onClose,
  onSelectSize,
}: SizingAssistantModalProps) {
  const { t, locale } = useApp()

  // Pre-seed sliders close to user's currently selected size if available
  const [heightCm, setHeightCm] = useState(() => {
    if (initialSize === '6') return 168
    if (initialSize === '10') return 190
    return 177
  })
  const [weightKg, setWeightKg] = useState(() => {
    if (initialSize === '6') return 65
    if (initialSize === '10') return 88
    return 78
  })
  const [fitPreference, setFitPreference] = useState<FitPreference>('traditional')

  // Recalculate instantly on input change
  const result = useMemo(
    () => calculateDaraaSize({ heightCm, weightKg, fitPreference }),
    [heightCm, weightKg, fitPreference],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const explanationText = result.explanation[locale] || result.explanation.ar

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={t('sizing.title')}
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-gold/40 bg-cream-card/95 p-6 shadow-2xl backdrop-blur-sm sm:p-8 dark:bg-[#19130d]/95"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-xs text-gold">
                ✨
              </span>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
                {t('sizing.title')}
              </h2>
            </div>
            <p className="mt-1 font-sans text-xs text-ink/70 sm:text-sm">
              {t('sizing.subtitle')}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('menu.close')}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink/60 transition-colors hover:border-gold hover:text-gold"
          >
            ✕
          </button>
        </div>

        {/* Inputs & Visuals */}
        <div className="mt-6 space-y-6">
          {/* Height slider */}
          <div>
            <div className="flex items-center justify-between font-sans text-sm">
              <label htmlFor="sizing-height" className="font-medium text-ink">
                {t('sizing.height')}
              </label>
              <span className="font-display text-lg font-bold text-gold">
                {heightCm} <span className="text-xs font-normal text-ink/50">cm</span>
              </span>
            </div>
            <input
              id="sizing-height"
              type="range"
              min="150"
              max="205"
              step="1"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-line accent-gold focus-visible:outline-none"
            />
            <div className="mt-1 flex justify-between font-sans text-[11px] text-ink/40">
              <span>150 cm</span>
              <span>175 cm</span>
              <span>205 cm</span>
            </div>
          </div>

          {/* Weight slider */}
          <div>
            <div className="flex items-center justify-between font-sans text-sm">
              <label htmlFor="sizing-weight" className="font-medium text-ink">
                {t('sizing.weight')}
              </label>
              <span className="font-display text-lg font-bold text-gold">
                {weightKg} <span className="text-xs font-normal text-ink/50">kg</span>
              </span>
            </div>
            <input
              id="sizing-weight"
              type="range"
              min="50"
              max="130"
              step="1"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-lg bg-line accent-gold focus-visible:outline-none"
            />
            <div className="mt-1 flex justify-between font-sans text-[11px] text-ink/40">
              <span>50 kg</span>
              <span>85 kg</span>
              <span>130 kg</span>
            </div>
          </div>

          {/* Fit Preference Toggle */}
          <div>
            <span className="block font-sans text-xs uppercase tracking-[0.15em] text-ink/60">
              {t('sizing.fit')}
            </span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFitPreference('traditional')}
                className={`rounded-xl border p-3 text-center font-sans text-xs transition-all ${
                  fitPreference === 'traditional'
                    ? 'border-gold bg-gold/10 font-semibold text-gold shadow-sm'
                    : 'border-line text-ink/70 hover:border-gold/50'
                }`}
              >
                {t('sizing.fit.traditional')}
              </button>
              <button
                type="button"
                onClick={() => setFitPreference('tailored')}
                className={`rounded-xl border p-3 text-center font-sans text-xs transition-all ${
                  fitPreference === 'tailored'
                    ? 'border-gold bg-gold/10 font-semibold text-gold shadow-sm'
                    : 'border-line text-ink/70 hover:border-gold/50'
                }`}
              >
                {t('sizing.fit.tailored')}
              </button>
            </div>
          </div>

          {/* Recommendation Card */}
          <div className="rounded-2xl border border-gold/50 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/60">
                {t('sizing.recommendation')}
              </span>
              <span className="rounded-full bg-gold/20 px-2.5 py-0.5 font-sans text-[11px] font-medium text-gold">
                {result.confidence === 'high' ? '98% Match' : '92% Match'}
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold text-gold sm:text-5xl">
                {result.isMadeToMeasure
                  ? t('sizing.madeToMeasure')
                  : `${result.recommendedSize}`}
              </span>
              {!result.isMadeToMeasure && (
                <span className="font-sans text-xs text-ink/60">
                  (Daraa Size {result.recommendedSize})
                </span>
              )}
            </div>

            <p className="mt-3 font-sans text-xs leading-relaxed text-ink/80 sm:text-sm">
              {explanationText}
            </p>

            {/* Garment Dimensions Preview */}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gold/20 pt-3 font-sans text-xs">
              <div>
                <span className="text-ink/50">{t('sizing.estimatedLength')}:</span>
                <p className="font-semibold text-ink">~{result.dimensions.estimatedLengthCm} cm</p>
              </div>
              <div>
                <span className="text-ink/50">{t('sizing.estimatedChest')}:</span>
                <p className="font-semibold text-ink">~{result.dimensions.estimatedChestCm} cm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand px-5 py-2.5 font-sans text-xs uppercase tracking-[0.2em] text-ink/60 transition-colors hover:text-gold"
          >
            {t('menu.close')}
          </button>

          <button
            type="button"
            onClick={() => {
              const selected = result.isMadeToMeasure
                ? 'Made-to-Measure'
                : result.recommendedSize
              onSelectSize(selected)
              onClose()
            }}
            className="rounded-brand bg-gold px-7 py-3 font-sans text-xs uppercase tracking-[0.2em] text-cream-card shadow-md transition-all hover:bg-gold-dark hover:shadow-lg"
          >
            {t('sizing.apply')} ({result.isMadeToMeasure ? t('sizing.madeToMeasure') : result.recommendedSize})
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
