import { useRef, useState } from 'react'
import type { DisplayStyle } from '@shared/constants/displayStyles'
import type { WardrobeSection } from '@shared/schemas/product.schema'
import { useApp } from '../../app/useApp'
import { uploadImage } from '../../lib/catalog'
import type { ProductImageAsset } from '../../lib/catalog'

interface SlotLabel {
  ar: string
  fr: string
  en: string
}

interface SlotConfig {
  key: string
  label: SlotLabel
  required: boolean
}

/** Pre-configured slots tailored to each display style — trilingual labels */
const STYLE_SLOTS: Record<DisplayStyle, SlotConfig[]> = {
  'stage-3d': [
    { key: 'front',   label: { ar: 'الواجهة الأمامية (0°)',         fr: 'Face avant (0°)',           en: 'Front View (0°)'      }, required: true  },
    { key: 'angle',   label: { ar: 'زاوية مائلة (45°)',              fr: 'Angle trois-quarts (45°)',  en: 'Three-Quarter (45°)'  }, required: false },
    { key: 'side',    label: { ar: 'الجانب (90°)',                   fr: 'Profil latéral (90°)',      en: 'Side Profile (90°)'   }, required: false },
    { key: 'back',    label: { ar: 'الجهة الخلفية (180°)',           fr: 'Vue arrière (180°)',        en: 'Back View (180°)'     }, required: false },
  ],
  rail: [
    { key: 'front',   label: { ar: 'صورة أمامية — معلقة على العلاقة', fr: 'Face avant — suspendue au rail', en: 'Front — Hanging on Rail' }, required: true  },
    { key: 'back',    label: { ar: 'صورة خلفية — ظهر القطعة',         fr: 'Vue arrière — dos du vêtement', en: 'Back View'               }, required: false },
  ],
  mannequin: [
    { key: 'front',   label: { ar: 'الواجهة الأمامية على المانيكان',  fr: 'Face avant sur mannequin',  en: 'Front on Mannequin'   }, required: true  },
    { key: 'back',    label: { ar: 'الجهة الخلفية على المانيكان',     fr: 'Vue arrière sur mannequin', en: 'Back on Mannequin'    }, required: false },
  ],
  cabinet: [
    { key: 'front',   label: { ar: 'القطعة الرئيسية (رف 1)',         fr: 'Pièce principale (Étagère 1)', en: 'Main Piece (Shelf 1)' }, required: true  },
    { key: 'variant2',label: { ar: 'قطعة ثانية (رف 2)',               fr: 'Pièce secondaire (Étagère 2)', en: 'Second Piece (Shelf 2)' }, required: false },
    { key: 'variant3',label: { ar: 'قطعة ثالثة (رف 3)',               fr: 'Troisième pièce (Étagère 3)', en: 'Third Piece (Shelf 3)'  }, required: false },
  ],
  shelf: [
    { key: 'front',   label: { ar: 'الصورة الرئيسية على الرف',       fr: 'Photo principale sur étagère', en: 'Primary on Shelf'     }, required: true  },
    { key: 'side',    label: { ar: 'الملف الجانبي',                  fr: 'Profil de côté',            en: 'Side Profile'         }, required: false },
    { key: 'detail',  label: { ar: 'صورة التفاصيل / البديل',         fr: 'Détail ou variante',        en: 'Detail / Variant'     }, required: false },
  ],
  wardrobe: [
    { key: 'front',   label: { ar: 'معلق على العلاقة (أمامي)',       fr: 'Suspendu — face avant',     en: 'Hanging — Front'      }, required: true  },
    { key: 'folded',  label: { ar: 'مطوي على الرف',                  fr: 'Plié sur l\'étagère',       en: 'Folded on Shelf'      }, required: false },
    { key: 'back',    label: { ar: 'الجهة الخلفية',                  fr: 'Vue arrière',               en: 'Back View'            }, required: false },
  ],
  floating: [
    { key: 'front',   label: { ar: 'الصورة البطولية الرئيسية',       fr: 'Photo héro principale',     en: 'Hero Shot (Main)'     }, required: true  },
    { key: 'angle',   label: { ar: 'بطاقة ثانية — زاوية مائلة',      fr: 'Carte 2 — angle oblique',   en: 'Card 2 — Angle Shot'  }, required: false },
    { key: 'side',    label: { ar: 'بطاقة ثالثة — جانبية',           fr: 'Carte 3 — vue de côté',     en: 'Card 3 — Side Shot'   }, required: false },
  ],
  'grid-clean': [
    { key: 'front',   label: { ar: 'الواجهة الأمامية',               fr: 'Face avant',                en: 'Front View'           }, required: true  },
    { key: 'back',    label: { ar: 'الجهة الخلفية',                  fr: 'Vue arrière',               en: 'Back View'            }, required: false },
    { key: 'detail',  label: { ar: 'صورة التفاصيل',                  fr: 'Photo de détail',           en: 'Detail Shot'          }, required: false },
  ],
}

/** Wardrobe sub-section specific slots */
const WARDROBE_SECTION_SLOTS: Record<string, SlotConfig[]> = {
  hanging: [
    { key: 'front', label: { ar: 'أمامي — معلق على العلاقة',           fr: 'Face avant — suspendu au cintre', en: 'Front — Hanging on Rod' }, required: true  },
    { key: 'back',  label: { ar: 'خلفي — ظهر القطعة المعلقة',           fr: 'Vue arrière — dos du vêtement',   en: 'Back View'              }, required: false },
  ],
  folded: [
    { key: 'front',  label: { ar: 'صورة علوية مسطحة (Flat-lay)',         fr: 'Photo à plat par dessus (Flat-lay)', en: 'Flat-lay Top-down'    }, required: true  },
    { key: 'folded', label: { ar: 'الواجهة الأمامية مطوية',              fr: 'Face avant pliée',               en: 'Folded Front View'      }, required: false },
  ],
  bottom: [
    { key: 'front',  label: { ar: 'الصورة البطولية (أحذية / عطور)',       fr: 'Photo héro (chaussures / parfums)', en: 'Hero Shot (Shoes / Perfumes)' }, required: true  },
    { key: 'detail', label: { ar: 'صورة التفاصيل — مقرّبة',              fr: 'Photo de détail — gros plan',    en: 'Detail — Close-up'      }, required: false },
  ],
}

/** Default standard photo slots when product is not featured in a specific scene */
const STANDARD_SLOTS: SlotConfig[] = [
  { key: 'front',  label: { ar: 'الواجهة الأمامية',    fr: 'Face avant',      en: 'Front View'  }, required: true  },
  { key: 'back',   label: { ar: 'الجهة الخلفية',       fr: 'Vue arrière',     en: 'Back View'   }, required: false },
  { key: 'detail', label: { ar: 'صورة التفاصيل',       fr: 'Photo de détail', en: 'Detail Shot' }, required: false },
]

interface ImageUploaderProps {
  label: string
  hint?: string
  displayStyle?: DisplayStyle | null
  wardrobeSection?: string
  value: ProductImageAsset[]
  onChange: (value: ProductImageAsset[]) => void
  folder: string
  multiple?: boolean
  removeBackground?: boolean
}

export function ImageUploader({
  label,
  hint,
  displayStyle,
  wardrobeSection,
  value,
  onChange,
  folder,
  removeBackground = true,
}: ImageUploaderProps) {
  const { t, locale } = useApp()
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null)
  const [busySlotIndex, setBusySlotIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // For wardrobe style with a specific section, use sub-section slots
  const slots =
    displayStyle === 'wardrobe' && wardrobeSection && WARDROBE_SECTION_SLOTS[wardrobeSection]
      ? WARDROBE_SECTION_SLOTS[wardrobeSection]
      : (displayStyle && STYLE_SLOTS[displayStyle]) || STANDARD_SLOTS

  function triggerSlotUpload(index: number) {
    setActiveSlotIndex(index)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
      fileInputRef.current.click()
    }
  }

  async function handleFileSelect(files: FileList | null) {
    if (!files || files.length === 0 || activeSlotIndex === null) return

    const file = files[0]
    const slotIdx = activeSlotIndex
    setBusySlotIndex(slotIdx)
    setError(null)

    try {
      const uploaded = await uploadImage(file, folder, { removeBackground })
      const next = [...value]
      // Replace at slot index, or pad array if slot is ahead
      while (next.length <= slotIdx) {
        next.push({ url: '' })
      }
      next[slotIdx] = uploaded
      // Filter out empty placeholders at the end
      while (next.length > 0 && !next[next.length - 1].url) {
        next.pop()
      }
      onChange(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image upload failed.')
    } finally {
      setBusySlotIndex(null)
      setActiveSlotIndex(null)
    }
  }

  function removeSlotImage(index: number) {
    const next = [...value]
    if (index < next.length) {
      next.splice(index, 1)
      onChange(next)
    }
  }

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-ink">
            {label}
          </span>
          {hint && (
            <p className="mt-0.5 font-sans text-xs text-ink/60">
              {hint}
            </p>
          )}
        </div>

        {removeBackground && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold/10 border border-gold/30 px-3 py-1 font-sans text-[11px] font-semibold text-gold-dark">
            <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            {t('admin.bgRemoval')}
          </span>
        )}
      </div>

      {/* Angle Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slots.map((slot, index) => {
          const image = value[index]?.url ? value[index] : null
          const isBusy = busySlotIndex === index

          return (
            <div
              key={slot.key}
              className={`group relative flex flex-col rounded-brand border transition-all ${
                image
                  ? 'border-gold/40 bg-cream-card/80 shadow-xs'
                  : 'border-dashed border-line hover:border-gold/60 bg-cream/30 hover:bg-gold/5'
              }`}
            >
              {/* Slot Header Badge */}
              <div className="flex items-center gap-1.5 border-b border-line/40 px-2.5 py-1.5 bg-cream-card/50 min-h-[32px]">
                <span
                  className={`font-sans text-[10px] font-semibold leading-tight ${slot.required ? 'text-gold-dark dark:text-gold' : 'text-ink/70'}`}
                >
                  {slot.label[locale]}
                </span>
                {slot.required && (
                  <span className="shrink-0 ms-auto font-sans text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/20 text-gold-dark dark:text-gold">
                    {locale === 'ar' ? 'مطلوب' : locale === 'fr' ? 'Requis' : 'Required'}
                  </span>
                )}
              </div>

              {/* Slot Body */}
              <div className="relative aspect-[3/4] flex items-center justify-center p-2">
                {isBusy ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <svg className="w-6 h-6 animate-spin text-gold" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="font-sans text-[10px] font-medium text-ink/70">
                      {t('admin.saving')}
                    </span>
                  </div>
                ) : image ? (
                  <>
                    {/* Checkerboard background to show transparency */}
                    <div
                      className="absolute inset-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(45deg, #bbb 25%, transparent 25%), linear-gradient(-45deg, #bbb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #bbb 75%), linear-gradient(-45deg, transparent 75%, #bbb 75%)',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                      }}
                    />
                    <img
                      src={image.url}
                      alt={image.alt ?? ''}
                      className="relative z-10 h-full w-full object-contain p-1"
                    />

                    {/* Hover controls */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <button
                        type="button"
                        onClick={() => triggerSlotUpload(index)}
                        className="rounded-full bg-cream-card p-1.5 text-ink hover:text-gold shadow-sm transition-transform hover:scale-110"
                        title="Replace"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlotImage(index)}
                        className="rounded-full bg-cream-card p-1.5 text-red-600 hover:text-red-700 shadow-sm transition-transform hover:scale-110"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerSlotUpload(index)}
                    className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-center p-2 group-hover:text-gold"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/10 text-gold group-hover:bg-gold group-hover:text-cream-card transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <span className="font-sans text-[10px] text-ink/60 group-hover:text-gold transition-colors leading-tight">
                      {t('admin.clickToUpload')}
                    </span>
                    <span className="font-sans text-[9px] uppercase tracking-wider text-ink/40">
                      {slot.required
                        ? (locale === 'ar' ? 'مطلوب' : locale === 'fr' ? 'Requis' : 'Required')
                        : (locale === 'ar' ? 'اختياري' : locale === 'fr' ? 'Optionnel' : 'Optional')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <p role="alert" className="font-sans text-xs text-red-600">
          {error}
        </p>
      )}

      {/* Hidden single file input reused by slot triggers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => handleFileSelect(event.target.files)}
      />
    </div>
  )
}
