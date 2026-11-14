import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../../app/useApp'
import { useCart } from '../../app/useCart'
import { useToast } from '../../app/useToast'
import { formatPrice } from '../catalog/ProductCard'

interface PerfumeNote {
  top: { ar: string; fr: string; en: string }
  heart: { ar: string; fr: string; en: string }
  base: { ar: string; fr: string; en: string }
  sillage: { ar: string; fr: string; en: string }
}

interface ShowcasePerfume {
  id: string
  slug: string
  name: { ar: string; fr: string; en: string }
  watermark: string
  subtitle: { ar: string; fr: string; en: string }
  price: number
  compareAtPrice?: number
  currency: string
  imageUrl: string
  accentColor: string // glow color
  glowGradient: string
  notes: PerfumeNote
}

const PERFUMES: ShowcasePerfume[] = [
  {
    id: 'oud-royal',
    slug: 'oud-royal-classy-100ml',
    name: {
      ar: 'عود ملكي إكستريت',
      fr: 'Oud Royal Classy Extrait',
      en: 'Royal Oud Classy Extrait',
    },
    watermark: 'ROYAL OUD',
    subtitle: {
      ar: 'تركيز ملكي فاخر يجسد أصالة الشرق والهيبة الموريتانية',
      fr: 'Extrait de parfum royal mêlant oud cambodgien et or ambré',
      en: 'A regal concentration blending Cambodian oud and liquid amber gold',
    },
    price: 3600,
    compareAtPrice: 4200,
    currency: 'MRU',
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    accentColor: '#c99a52',
    glowGradient: 'radial-gradient(circle at center, rgba(201,154,82,0.45) 0%, rgba(160,116,52,0.18) 45%, transparent 75%)',
    notes: {
      top: { ar: 'زعفران أحمر • هيل أخضر نقي', fr: 'Safran Royal • Cardamome Verte', en: 'Red Saffron • Green Cardamom' },
      heart: { ar: 'عود كمبودي عتيق • دهن الورد', fr: 'Cœur Oud Cambodgien • Rose de Mai', en: 'Cambodian Agarwood • Rose Otto' },
      base: { ar: 'عنبر أشهب • مسك غزال مدخن', fr: 'Ambre Gris Pur • Musc Précieux', en: 'Aged Ambergris • Smoky Deer Musk' },
      sillage: { ar: 'تركيز فائق 35% • ثبات يتجاوز 24 ساعة', fr: 'Extrait 35% • Sillage impérial +24h', en: '35% Extrait • 24h+ Majestic Sillage' },
    },
  },
  {
    id: 'ambre-santal',
    slug: 'ambre-santal-prive',
    name: {
      ar: 'عنبر وصندل خاص',
      fr: 'Ambre Santal Privé',
      en: 'Private Amber Sandalwood',
    },
    watermark: 'AMBRE SANTAL',
    subtitle: {
      ar: 'توليفة دافئة آسرة من خشب الصندل العتيق والزهور النادرة',
      fr: 'Sillage enveloppant de santal de Mysore et ambre doré',
      en: 'Magnetic and velvety blend of Mysore sandalwood and golden amber',
    },
    price: 3200,
    currency: 'MRU',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    accentColor: '#d97736',
    glowGradient: 'radial-gradient(circle at center, rgba(217,119,54,0.45) 0%, rgba(180,83,9,0.2) 45%, transparent 75%)',
    notes: {
      top: { ar: 'برغموت كالابريا • فلفل وردي', fr: 'Bergamote Sauvage • Poivre Rose', en: 'Wild Bergamot • Pink Peppercorn' },
      heart: { ar: 'ورد طائفي ملكي • ياسمين صحراوي', fr: 'Rose de Taïf • Jasmin Impérial', en: 'Taif Royal Rose • Desert Jasmine' },
      base: { ar: 'خشب صندل ميسور • فانيليا بوربون', fr: 'Santal de Mysore • Vanille Bourbon', en: 'Mysore Sandalwood • Bourbon Vanilla' },
      sillage: { ar: 'دفء جذاب وهالة ساحرة للمناسبات', fr: 'Chaleur magnétique pour soirées exclusives', en: 'Magnetic warmth crafted for elite evenings' },
    },
  },
  {
    id: 'desert-noir',
    slug: 'desert-noir-intense',
    name: {
      ar: 'ديزيرت نوار إنتنس',
      fr: 'Désert Noir Intense',
      en: 'Desert Noir Intense',
    },
    watermark: 'DESERT NOIR',
    subtitle: {
      ar: 'غموض ليالي الصحراء وسحر دخان اللبان المعتق مع الجلود الفاخرة',
      fr: 'Mystère saharien d’encens noir, cuir raffiné et bois fumés',
      en: 'Enigmatic Saharan night of smoky incense, rich leather, and dark woods',
    },
    price: 3900,
    currency: 'MRU',
    imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
    accentColor: '#4f46e5',
    glowGradient: 'radial-gradient(circle at center, rgba(79,70,229,0.40) 0%, rgba(30,27,75,0.25) 50%, transparent 75%)',
    notes: {
      top: { ar: 'لبان حوجري • تين مجفف عتيق', fr: 'Encens Hojari Pur • Figue Sèche', en: 'Hojari Royal Frankincense • Dried Fig' },
      heart: { ar: 'جلد إيطالي معتق • باتشولي إندونيسي', fr: 'Cuir d’Atelier • Patchouli Sombre', en: 'Aged Leather Accord • Dark Patchouli' },
      base: { ar: 'خشب الأرز الأطلسي • عود مدخن', fr: 'Cèdre de l’Atlas • Bois d’Oud Brûlé', en: 'Atlas Cedarwood • Roasted Oud Wood' },
      sillage: { ar: 'طابع نيش رجالي شديد الهيبة والغموض', fr: 'Signature de caractère pour leader affirmé', en: 'Bold statement sillage of distinguished authority' },
    },
  },
  {
    id: 'bakhoor-malaki',
    slug: 'bakhoor-malaki-prestige',
    name: {
      ar: 'بخور ملكي معطر فاخر',
      fr: 'Bakhoor Malaki Parfumé',
      en: 'Royal Malaki Bakhoor',
    },
    watermark: 'MALAKI OUD',
    subtitle: {
      ar: 'أجود كسر العود المروكي المشبع بدهن العود والعنبر لتعطير المجالس',
      fr: 'Copeaux d’oud de prestige imprégnés d’huiles royales pour intérieurs',
      en: 'Prestige Moroccan oud wood saturated with royal oils for distinguished gatherings',
    },
    price: 1500,
    currency: 'MRU',
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    accentColor: '#10b981',
    glowGradient: 'radial-gradient(circle at center, rgba(16,185,129,0.35) 0%, rgba(6,78,59,0.2) 50%, transparent 75%)',
    notes: {
      top: { ar: 'دهن عود صافي • ماء الورد المقطر', fr: 'Huile d’Oud Pure • Eau de Rose Distillée', en: 'Pure Oud Essence • Distilled Rosewater' },
      heart: { ar: 'راتنج العود المروكي الملكي', fr: 'Résine d’Oud Maroki Impérial', en: 'Imperial Maroki Oud Resin' },
      base: { ar: 'عنبر جامد • خشب الكندر المحروق', fr: 'Ambre Gris Solide • Bois Précieux', en: 'Solid Amber Block • Burning Incense Wood' },
      sillage: { ar: 'أريج بخور يدوم في الثياب والمكان لأيام', fr: 'Parfume les étoffes et demeures plusieurs jours', en: 'Infuses fabrics and spaces with timeless elegance' },
    },
  },
]

export function PerfumeShowcaseSection() {
  const { locale } = useApp()
  const { add } = useCart()
  const { luxury: toastLuxury } = useToast()

  const [activeIdx, setActiveIdx] = useState(0)
  const current = PERFUMES[activeIdx]

  // 3D tilt tracking for mouse movement inside the stage
  const stageRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    // Limit degrees to subtle realistic tilt
    const rotateY = (x / (rect.width / 2)) * 14
    const rotateX = -(y / (rect.height / 2)) * 14
    setTilt({ rotateX, rotateY })
  }

  function handleMouseLeave() {
    setTilt({ rotateX: 0, rotateY: 0 })
  }

  function handleAddToCart() {
    add(
      {
        productId: current.id,
        slug: current.slug,
        name: current.name,
        price: current.price,
        currency: current.currency,
        image: current.imageUrl,
        size: '100ml',
      },
      1,
    )
    toastLuxury(
      locale === 'ar' ? 'تمت إضافة العطر إلى السلة' : locale === 'fr' ? 'Parfum ajouté au panier' : 'Perfume added to cart',
      current.name[locale],
      4000,
    )
  }

  const localizedLabels = {
    ar: {
      tag: 'مجموعة العطور الحصرية',
      notesHeader: 'الهرم العطري والنوتات',
      topNote: 'الافتتاحية',
      heartNote: 'قلب العطر',
      baseNote: 'القاعدة',
      performance: 'الثبات والانتشار',
      addToCart: 'إضافة إلى السلة',
      explore: 'تفاصيل العطر',
      switchHint: 'اختر العطر لعرض هويته الملكية',
    },
    fr: {
      tag: 'COLLECTION HAUTE PARFUMERIE',
      notesHeader: 'Pyramide Olfactive',
      topNote: 'Notes de Tête',
      heartNote: 'Notes de Cœur',
      baseNote: 'Notes de Fond',
      performance: 'Sillage & Tenue',
      addToCart: 'Ajouter au panier',
      explore: 'Détails du flacon',
      switchHint: 'Sélectionnez une fragrance pour révéler son aura',
    },
    en: {
      tag: 'HAUTE PARFUMERIE SHOWCASE',
      notesHeader: 'Olfactory Pyramid',
      topNote: 'Top Notes',
      heartNote: 'Heart Notes',
      baseNote: 'Base Notes',
      performance: 'Sillage & Longevity',
      addToCart: 'Add to Cart',
      explore: 'Explore Bottle',
      switchHint: 'Select a fragrance to experience its signature aura',
    },
  }[locale]

  return (
    <section className="relative w-full overflow-hidden bg-cream py-20 lg:py-28 text-ink selection:bg-gold selection:text-ink dark:bg-[#090807] dark:text-cream-card transition-colors duration-300">
      {/* ── 1. DYNAMIC COLOR AURA (Arka Plan Işık Patlaması) ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.15 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="h-[650px] w-[650px] sm:h-[800px] sm:w-[800px] rounded-full blur-3xl opacity-75"
            style={{ background: current.glowGradient }}
          />
          {/* Subtle star speckles */}
          <div className="absolute inset-0 bg-[radial-gradient(rgba(201,154,82,0.15)_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
        </motion.div>
      </AnimatePresence>

      {/* ── 2. GIANT BACKGROUND WATERMARK TYPOGRAPHY (Zero Bullshit tarzı dev metin) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-10 select-none"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={current.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 1.05 }}
            transition={{ duration: 0.7 }}
            className="font-display text-[16vw] font-black uppercase tracking-tighter text-ink/20 dark:text-white whitespace-nowrap drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]"
          >
            {current.watermark}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.3em] text-gold-dark dark:text-gold">
            <span className="h-px w-6 bg-gold" />
            {localizedLabels.tag}
            <span className="h-px w-6 bg-gold" />
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl font-normal text-ink dark:text-cream-card tracking-tight">
            Classy Men Rim Privé
          </h2>
        </div>

        {/* ── 3. MAIN INTERACTIVE 3D STAGE (Video ile birebir uyumlu merkez sahne) ── */}
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center min-h-[580px] rounded-2xl border border-line bg-cream-card/90 p-6 sm:p-10 backdrop-blur-xl shadow-xl dark:border-gold/20 dark:bg-[#120f0c]/60 dark:shadow-[0_20px_80px_rgba(0,0,0,0.8)] [perspective:1400px]"
        >
          {/* ── Left Column: Olfactory Notes Panel (Notalar ve İçerik Katmanları) ── */}
          <div className="lg:col-span-4 z-10 space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-5"
              >
                <div>
                  <span
                    className="inline-block rounded-full px-3 py-1 font-sans text-[11px] font-bold uppercase tracking-widest text-ink shadow-sm"
                    style={{ backgroundColor: current.accentColor }}
                  >
                    Extrait de Parfum
                  </span>
                  <h3 className="mt-3 font-display text-2xl sm:text-3xl text-ink dark:text-cream-card leading-tight">
                    {current.name[locale]}
                  </h3>
                  <p className="mt-2 font-text text-sm text-ink/75 dark:text-cream-card/70 leading-relaxed">
                    {current.subtitle[locale]}
                  </p>
                </div>

                {/* Fragrance Pyramid Notes */}
                <div className="space-y-3.5 rounded-xl border border-gold/30 bg-cream/70 dark:bg-black/40 p-4 sm:p-5 backdrop-blur-md">
                  <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-gold-dark dark:text-gold font-semibold flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                    {localizedLabels.notesHeader}
                  </p>

                  {/* Top Note */}
                  <div className="border-b border-gold/15 pb-2.5">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-ink/50 dark:text-cream-card/50">
                      {localizedLabels.topNote}
                    </span>
                    <p className="font-sans text-xs sm:text-sm font-medium text-ink dark:text-cream-card mt-0.5">
                      {current.notes.top[locale]}
                    </p>
                  </div>

                  {/* Heart Note */}
                  <div className="border-b border-gold/15 pb-2.5">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold-light/80">
                      {localizedLabels.heartNote}
                    </span>
                    <p className="font-sans text-xs sm:text-sm font-semibold text-gold-dark dark:text-gold-light mt-0.5">
                      {current.notes.heart[locale]}
                    </p>
                  </div>

                  {/* Base Note */}
                  <div className="border-b border-gold/15 pb-2.5">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-ink/50 dark:text-cream-card/50">
                      {localizedLabels.baseNote}
                    </span>
                    <p className="font-sans text-xs sm:text-sm font-medium text-ink dark:text-cream-card mt-0.5">
                      {current.notes.base[locale]}
                    </p>
                  </div>

                  {/* Sillage indicator */}
                  <div className="pt-1">
                    <span className="font-sans text-[10px] uppercase tracking-wider text-gold-dark dark:text-gold/70">
                      {localizedLabels.performance}
                    </span>
                    <p className="font-sans text-xs text-ink/80 dark:text-cream-card/80 mt-0.5 italic">
                      {current.notes.sillage[locale]}
                    </p>
                  </div>
                </div>

                {/* Price and CTA */}
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <div>
                    <span className="font-display text-2xl font-bold text-gold-dark dark:text-gold">
                      {formatPrice(current.price, current.currency)}
                    </span>
                    {current.compareAtPrice && (
                      <span className="ms-2 font-sans text-xs text-ink/40 dark:text-cream-card/40 line-through">
                        {formatPrice(current.compareAtPrice, current.currency)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 min-w-[160px] rounded-brand bg-gradient-to-r from-gold via-gold-light to-gold px-5 py-3 font-sans text-xs uppercase tracking-[0.2em] font-bold text-ink shadow-[0_4px_20px_rgba(201,154,82,0.35)] hover:shadow-[0_6px_25px_rgba(201,154,82,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    {localizedLabels.addToCart}
                  </button>

                  <Link
                    to={`/product/${current.slug}`}
                    className="rounded-brand border border-gold/40 px-4 py-3 font-sans text-xs uppercase tracking-[0.15em] text-gold-dark dark:text-gold hover:border-gold hover:bg-gold/10 transition-colors"
                  >
                    {localizedLabels.explore} →
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Center & Right: 3D HERO BOTTLE & GLOSSY REFLECTIVE PODIUM ── */}
          <div className="lg:col-span-8 flex flex-col items-center justify-center relative min-h-[380px] sm:min-h-[460px]">
            {/* 3D Tiltable Bottle Container */}
            <motion.div
              style={{
                transformStyle: 'preserve-3d',
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
            >
              {/* Backlight halo directly kissing the bottle */}
              <div
                className="absolute h-72 w-72 rounded-full blur-2xl opacity-60"
                style={{ backgroundColor: current.accentColor }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, y: 30, scale: 0.9, rotateY: -20 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, y: -30, scale: 0.9, rotateY: 20 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 flex flex-col items-center"
                >
                  {/* Real bottle image with shadow */}
                  <img
                    src={current.imageUrl}
                    alt={current.name[locale]}
                    className="h-72 sm:h-96 w-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)] filter brightness-105 contrast-110"
                    draggable={false}
                  />

                  {/* ── Glossy Floor Reflection (Aynalı Zemin Yansıması) ── */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none -mt-4 h-36 w-full overflow-hidden opacity-25 filter blur-[0.5px]"
                    style={{
                      transform: 'scaleY(-1)',
                      maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 80%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 80%)',
                    }}
                  >
                    <img
                      src={current.imageUrl}
                      alt=""
                      className="h-72 sm:h-96 w-auto object-contain mx-auto"
                      draggable={false}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Glossy circular pedestal plate */}
              <div
                className="absolute -bottom-8 h-8 w-72 sm:w-96 rounded-full border border-gold/40 bg-gradient-to-r from-transparent via-gold/30 to-transparent blur-[1px]"
                aria-hidden="true"
              />
            </motion.div>
          </div>
        </div>

        {/* ── 4. ARC CAROUSEL / BOTTLE SELECTOR STRIP (Alttaki Kavisli Seçici Bar) ── */}
        <div className="mt-10">
          <p className="text-center font-sans text-xs uppercase tracking-[0.25em] text-ink/60 dark:text-cream-card/60 mb-5">
            {localizedLabels.switchHint}
          </p>

          <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto pb-4 pt-2">
            {PERFUMES.map((perfume, idx) => {
              const active = idx === activeIdx
              return (
                <button
                  key={perfume.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  className={`group relative flex flex-col items-center rounded-xl p-3 sm:p-4 border transition-all duration-300 cursor-pointer ${
                    active
                      ? 'border-gold bg-gold/15 scale-105 shadow-[0_0_25px_rgba(201,154,82,0.4)]'
                      : 'border-line bg-cream-card/90 hover:border-gold/50 hover:bg-gold/5 opacity-80 hover:opacity-100 dark:border-white/10 dark:bg-black/40'
                  }`}
                >
                  {/* Miniature bottle with glow */}
                  <div className="relative h-20 w-16 sm:h-24 sm:w-20 flex items-center justify-center">
                    <img
                      src={perfume.imageUrl}
                      alt={perfume.name[locale]}
                      className="max-h-full max-w-full object-contain drop-shadow"
                    />
                    {active && (
                      <span
                        className="absolute inset-0 rounded-full blur-md opacity-40"
                        style={{ backgroundColor: perfume.accentColor }}
                      />
                    )}
                  </div>

                  {/* Title */}
                  <span className={`mt-2 font-sans text-xs text-center font-medium line-clamp-1 ${active ? 'text-gold-dark dark:text-gold-light font-bold' : 'text-ink/75 dark:text-cream-card/70'}`}>
                    {perfume.name[locale]}
                  </span>

                  <span className="font-mono text-[11px] text-gold-dark dark:text-gold/80 mt-0.5">
                    {formatPrice(perfume.price, perfume.currency)}
                  </span>

                  {/* Active bottom indicator line */}
                  {active && (
                    <motion.span
                      layoutId="activePerfumeIndicator"
                      className="absolute -bottom-1 h-[2px] w-12 bg-gold shadow-[0_0_8px_#c99a52]"
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

