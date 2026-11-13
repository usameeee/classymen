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
    { key: 'folded', label: { ar: 'صورة القطعة مطوية على الرف',           fr: 'Pièce pliée sur étagère',         en: 'Folded on Shelf'        }, required: true  },
    { key: 'front',  label: { ar: 'صورة القطعة مفتوحة بالكامل (اختياري)',   fr: 'Pièce dépliée (optionnel)',       en: 'Full Unfolded (Optional)' }, required: false },
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

/**
 * Returns the exact, dedicated photo shooting / AI generation prompt for a specific slot.
 */
function getSlotPrompt(
  slotKey: string,
  displayStyle?: DisplayStyle | null,
  wardrobeSection?: WardrobeSection,
): string {
  if (displayStyle === 'wardrobe') {
    if (wardrobeSection === 'hanging') {
      if (slotKey === 'front') {
        return 'صورة لقطعة ملابس رجالية فاخرة معلقة على شماعة خشبية أو معدنية أنيقة، زاوية أمامية مستقيمة كاملة، إضاءة استوديو متوازنة وناعمة، خلفية بيضاء نقية معزولة تماماً بدون خلفية (PNG cut-out, isolated pure white background, studio lighting).'
      }
      if (slotKey === 'back') {
        return 'صورة خلفية لنفس القطعة معلقة على الشماعة، زاوية 180 درجة من الظهر، نفس الإضاءة والاستوديو، خلفية بيضاء نقية معزولة تماماً بدون خلفية (Back view 180-degree, isolated transparent/pure white background, PNG cut-out).'
      }
    }
    if (wardrobeSection === 'folded') {
      if (slotKey === 'folded') {
        return 'صورة لقطعة ملابس رجالية فاخرة مطوية بعناية فائقة ومرتبة كأنها في رف بوتيك، زاوية علوية مائلة خفيفة (35° top angle) تبرز الياقة وثنيات القماش، إضاءة استوديو ناعمة وبدون ظلال، خلفية بيضاء نقية معزولة تماماً بدون خلفية (Neatly folded luxury garment on flat shelf surface, 35-degree top angle, studio lighting, isolated transparent or pure white background, PNG cut-out).'
      }
      if (slotKey === 'front') {
        return 'صورة لنفس القطعة مفرودة بالكامل وممدودة الأكمام بشكل مستوٍ، زاوية رؤية علوية 90 درجة (Flat lay / top-down view)، إضاءة استوديو ناعمة، خلفية بيضاء نقية معزولة تماماً بدون خلفية (Full flat-lay open garment view, isolated pure white background, PNG cut-out).'
      }
    }
    if (wardrobeSection === 'bottom') {
      if (slotKey === 'front') {
        return 'صورة لمنتج فاخر (حذاء جلدي راقٍ أو زجاجة عطر رجالي فاخر)، زاوية رؤية أمامية مائلة 45 درجة (Hero product shot)، تفاصيل الملمس والإضاءة البراقة واضحة وواقعية، خلفية بيضاء نقية معزولة تماماً بدون خلفية (Luxury footwear / perfume hero product shot, 45-degree angle, cinematic studio lighting, isolated transparent or pure white background, PNG cut-out).'
      }
      if (slotKey === 'detail') {
        return 'صورة مقربة عالية الدقة لتفاصيل المنتج الفاخر (الملمس الجلدي، الخياطة، أو غطاء العطر والنقوش)، إضاءة ماكرو دقيقة، خلفية بيضاء نقية معزولة تماماً بدون خلفية (Close-up detail shot, macro studio lighting, isolated transparent or pure white background, PNG cut-out).'
      }
    }
  }

  if (displayStyle === 'rail') {
    if (slotKey === 'front') {
      return 'صورة لقطعة ملابس رجالية معلقة على علاقة أنيقة، زاوية أمامية كاملة، إضاءة استوديو متوازنة، خلفية بيضاء نقية معزولة تماماً (PNG cut-out, studio lighting).'
    }
    if (slotKey === 'back') {
      return 'صورة خلفية لنفس القطعة من الظهر 180 درجة، معلقة على العلاقة، خلفية بيضاء نقية معزولة تماماً (Back view 180-degree, PNG cut-out).'
    }
  }

  if (displayStyle === 'stage-3d') {
    if (slotKey === 'front') {
      return 'صورة للمنتج من زاوية أمامية مباشرة (0°)، محاذاة عمودية دقيقة، إضاءة استوديو موحدة، خلفية بيضاء نقية معزولة تماماً (PNG cut-out, 0-degree front view).'
    }
    if (slotKey === 'angle') {
      return 'صورة للمنتج من زاوية مائلة 45 درجة (Three-quarter angle)، نفس الارتفاع والإضاءة، خلفية بيضاء نقية معزولة تماماً (PNG cut-out, 45-degree angle).'
    }
    if (slotKey === 'side') {
      return 'صورة جانبية للمنتج بزاوية 90 درجة تماماً (Side profile)، نفس الارتفاع والإضاءة، خلفية بيضاء نقية معزولة تماماً (PNG cut-out, 90-degree side view).'
    }
    if (slotKey === 'back') {
      return 'صورة خلفية للمنتج بزاوية 180 درجة تماماً (Back view)، نفس الارتفاع والإضاءة، خلفية بيضاء نقية معزولة تماماً (PNG cut-out, 180-degree back view).'
    }
  }

  if (displayStyle === 'mannequin') {
    if (slotKey === 'front') {
      return 'صورة للقطعة ملبوسة على مانيكان شبحي غير مرئي (Ghost Mannequin)، واجهة أمامية مستقيمة كاملة، إضاءة استوديو هادئة، خلفية بيضاء معزولة تماماً (PNG cut-out).'
    }
    if (slotKey === 'back') {
      return 'صورة خلفية لنفس القطعة على المانيكان، زاوية 180 درجة، خلفية بيضاء معزولة تماماً (PNG cut-out).'
    }
  }

  if (slotKey === 'front') {
    return 'صورة احترافية للمنتج من الأمام، إضاءة استوديو متوازنة، خلفية بيضاء نقية معزولة تماماً بدون خلفية (PNG cut-out).'
  }
  if (slotKey === 'back') {
    return 'صورة خلفية للمنتج، إضاءة متوازنة، خلفية بيضاء نقية معزولة تماماً (PNG cut-out).'
  }
  if (slotKey === 'detail') {
    return 'صورة مقربة لتفاصيل القطعة والملمس، إضاءة ماكرو واضحة، خلفية بيضاء نقية معزولة تماماً (PNG cut-out).'
  }
  return 'صورة احترافية للمنتج بإضاءة استوديو ناعمة وزاوية واضحة، خلفية بيضاء نقية معزولة تماماً بدون خلفية (PNG cut-out).'
}

interface ImageUploaderProps {
  label: string
  hint?: string
  displayStyle?: DisplayStyle | null
  wardrobeSection?: WardrobeSection
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
  const [copiedSlotIndex, setCopiedSlotIndex] = useState<number | null>(null)
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

  function handleCopySlotPrompt(index: number, promptText: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(promptText).then(() => {
        setCopiedSlotIndex(index)
        setTimeout(() => setCopiedSlotIndex(null), 2000)
      })
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
      while (next.length <= slotIdx) {
        next.push({ url: '' })
      }
      next[slotIdx] = uploaded
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
      {/* ── Header bar (NO EMOJIS) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-line/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-ink">
              {label}
            </span>
            {displayStyle && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-gold/40 bg-gold/10 text-gold-dark font-medium">
                {displayStyle === 'wardrobe' && wardrobeSection
                  ? `${displayStyle} • ${wardrobeSection}`
                  : displayStyle}
              </span>
            )}
          </div>
          {hint && (
            <p className="mt-0.5 font-sans text-xs text-ink/60">
              {hint}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {removeBackground && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold/10 border border-gold/30 px-3 py-1 font-sans text-[11px] font-semibold text-gold-dark">
              <svg className="w-3.5 h-3.5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              {t('admin.bgRemoval')}
            </span>
          )}
        </div>
      </div>

      {/* ── Angle Slots Grid (Each slot has its own dedicated prompt & copy button) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {slots.map((slot, index) => {
          const image = value[index]?.url ? value[index] : null
          const isBusy = busySlotIndex === index
          const isCopied = copiedSlotIndex === index
          const slotPrompt = getSlotPrompt(slot.key, displayStyle, wardrobeSection)

          return (
            <div
              key={slot.key}
              className={`group relative flex flex-col rounded-brand border transition-all overflow-hidden ${
                image
                  ? 'border-gold/40 bg-cream-card/80 shadow-xs'
                  : 'border-dashed border-line hover:border-gold/60 bg-cream/30 hover:bg-gold/5'
              }`}
            >
              {/* Slot Header Badge */}
              <div className="flex items-center justify-between gap-1.5 border-b border-line/40 px-2.5 py-1.5 bg-cream-card/50 min-h-[32px]">
                <span
                  className={`font-sans text-[11px] font-semibold leading-tight ${slot.required ? 'text-gold-dark dark:text-gold' : 'text-ink/80'}`}
                >
                  {slot.label[locale]}
                </span>
                {slot.required && (
                  <span className="shrink-0 font-sans text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold/20 text-gold-dark dark:text-gold">
                    {locale === 'ar' ? 'مطلوب' : locale === 'fr' ? 'Requis' : 'Required'}
                  </span>
                )}
              </div>

              {/* Slot Image Box */}
              <div className="relative aspect-[4/3] sm:aspect-square flex items-center justify-center p-2">
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
                        className="rounded-full bg-cream-card p-1.5 text-ink hover:text-gold shadow-sm transition-transform hover:scale-110 cursor-pointer"
                        title={locale === 'ar' ? 'استبدال الصورة' : 'Replace Image'}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSlotImage(index)}
                        className="rounded-full bg-cream-card p-1.5 text-ink hover:text-crimson shadow-sm transition-transform hover:scale-110 cursor-pointer"
                        title={locale === 'ar' ? 'حذف الصورة' : 'Delete Image'}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => triggerSlotUpload(index)}
                    className="flex flex-col items-center justify-center gap-1.5 text-center p-3 w-full h-full cursor-pointer focus:outline-none"
                  >
                    <div className="rounded-full bg-gold/10 p-2 text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </div>
                    <span className="font-sans text-[11px] font-medium text-ink/70 group-hover:text-gold transition-colors">
                      {locale === 'ar' ? 'رفع الصورة' : 'Upload Image'}
                    </span>
                  </button>
                )}
              </div>

              {/* ── Slot Dedicated Prompt Bar & Copy Button (NO EMOJIS) ── */}
              <div className="border-t border-line/50 p-2 bg-cream-card/60 flex flex-col gap-1.5">
                <p
                  className="font-sans text-[10px] leading-relaxed text-ink/80 line-clamp-2 text-start select-text"
                  title={slotPrompt}
                >
                  {slotPrompt}
                </p>
                <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-line/30">
                  <span className="font-mono text-[9px] text-ink/50 uppercase tracking-widest">
                    {slot.key}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopySlotPrompt(index, slotPrompt)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-gold/50 bg-gold/15 hover:bg-gold hover:text-black font-sans text-[10px] font-semibold text-gold-dark transition-all cursor-pointer shadow-2xs active:scale-95"
                    title={locale === 'ar' ? 'نسخ برومبت هذه الصورة' : 'Copy Slot Prompt'}
                  >
                    {isCopied ? (
                      <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                    <span>
                      {isCopied
                        ? (locale === 'ar' ? 'تم النسخ' : 'Copied')
                        : (locale === 'ar' ? 'نسخ البرومبت' : 'Copy Prompt')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <p className="font-sans text-xs text-crimson mt-1">{error}</p>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />
    </div>
  )
}
