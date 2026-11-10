import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Wordmark } from '../../components/brand/Wordmark'
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher'
import { ThemeToggle } from '../../components/ui/ThemeToggle'
import { useApp } from '../../app/useApp'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

/** Authentic Mauritanian Daraa historical photography from Wikimedia Commons */
const REAL_DARAA_PHOTO =
  'https://upload.wikimedia.org/wikipedia/commons/c/cb/Mauritanian_with_Saharan_blue_daraa.jpg'

/**
 * Grand Illuminated Daraa Backdrop (Işıklı ve Gerçekçi Moritanya Daraa Atmosferi)
 */
export function GrandDaraaBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden bg-[#100d0a]"
    >
      {/* 1. Real Mauritanian Daraa Heritage Photography */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={REAL_DARAA_PHOTO}
          alt="Authentic Mauritanian Daraa"
          loading="eager"
          className="h-full w-full object-cover object-top opacity-30 mix-blend-luminosity filter contrast-125 brightness-90 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#100d0a] via-[#100d0a]/70 to-[#100d0a]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_#100d0a_85%)]" />
      </div>

      {/* 2. Volumetric Golden God Rays */}
      <div className="absolute -top-20 h-[700px] w-[900px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(217,176,112,0.30)_0%,_rgba(160,116,52,0.15)_40%,_transparent_75%)] blur-3xl" />
      <div className="absolute -top-10 left-1/4 h-[500px] w-48 -rotate-12 bg-gradient-to-b from-gold/20 via-gold/5 to-transparent blur-2xl" />
      <div className="absolute -top-10 right-1/4 h-[500px] w-48 rotate-12 bg-gradient-to-b from-gold/20 via-gold/5 to-transparent blur-2xl" />

      {/* 3. Breathing Golden Aura */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(201,154,82,0.32)_0%,_transparent_70%)] blur-3xl"
      />

      {/* 4. Fine Gold Bullion Stitching & Moroccan/Mauritanian Arch Geometry */}
      <svg
        viewBox="0 0 1000 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute h-full w-auto max-w-none opacity-40 mix-blend-screen"
      >
        <defs>
          <linearGradient id="goldGleam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff3d1" />
            <stop offset="30%" stopColor="#c99a52" />
            <stop offset="70%" stopColor="#a07434" />
            <stop offset="100%" stopColor="#5a3d13" />
          </linearGradient>
          <filter id="goldShine">
            <feGaussianBlur stdDeviation="4" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        <path
          d="M150 800V340C150 160 300 60 500 60C700 60 850 160 850 340V800"
          stroke="url(#goldGleam)"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <path
          d="M170 800V345C170 175 310 80 500 80C690 80 830 175 830 345V800"
          stroke="url(#goldGleam)"
          strokeWidth="1"
          strokeDasharray="6 4"
          opacity="0.3"
        />

        <g filter="url(#goldShine)">
          <path d="M440 180 L500 320 L560 180" stroke="url(#goldGleam)" strokeWidth="3" strokeLinecap="round" />
          <path d="M448 185 L500 310 L552 185" stroke="url(#goldGleam)" strokeWidth="1.2" strokeDasharray="3 3" />

          <polygon points="500,320 545,370 500,420 455,370" stroke="url(#goldGleam)" strokeWidth="2" fill="none" />
          <polygon points="500,335 530,370 500,405 470,370" stroke="url(#goldGleam)" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="500" cy="370" r="4" fill="url(#goldGleam)" />

          <polygon points="440,240 380,285 440,310" stroke="url(#goldGleam)" strokeWidth="1.5" fill="none" />
          <polygon points="560,240 620,285 560,310" stroke="url(#goldGleam)" strokeWidth="1.5" fill="none" />

          <path
            d="M570 330 H655 V450 H570 Z"
            stroke="url(#goldGleam)"
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />
          <polygon points="612,370 630,390 612,410 594,390" stroke="url(#goldGleam)" strokeWidth="1.2" fill="none" />
        </g>
      </svg>

      {/* 5. Golden Starlight Sparks */}
      <div className="absolute inset-0 bg-[radial-gradient(#d9b070_1px,_transparent_1px)] [background-size:40px_40px] opacity-20" />
    </div>
  )
}

/**
 * Hand-stitched Daraa embroidery divider
 */
export function GoldStitchDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-gold ${className}`} aria-hidden="true">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/60 to-gold" />
      <svg width="100" height="14" viewBox="0 0 100 14" fill="none" className="shrink-0 text-gold">
        <line x1="0" y1="7" x2="32" y2="7" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <polygon points="50,1 56,7 50,13 44,7" stroke="currentColor" strokeWidth="1.4" fill="none" />
        <circle cx="50" cy="7" r="1.8" fill="currentColor" />
        <polygon points="38,3 41,7 38,11 35,7" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.75" />
        <polygon points="62,3 65,7 62,11 59,7" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.75" />
        <line x1="68" y1="7" x2="100" y2="7" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
      </svg>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gold/60 to-gold" />
    </div>
  )
}

/**
 * Handcrafted L-bracket corner marks with delicate brass rivets
 */
function TailorCornerMarks() {
  return (
    <>
      <div className="pointer-events-none absolute top-3.5 start-3.5 h-4 w-4 border-t-2 border-s-2 border-gold/70">
        <span className="absolute -top-[3px] -start-[3px] h-1.5 w-1.5 rounded-full bg-gold" />
      </div>
      <div className="pointer-events-none absolute top-3.5 end-3.5 h-4 w-4 border-t-2 border-e-2 border-gold/70">
        <span className="absolute -top-[3px] -end-[3px] h-1.5 w-1.5 rounded-full bg-gold" />
      </div>
      <div className="pointer-events-none absolute bottom-3.5 start-3.5 h-4 w-4 border-b-2 border-s-2 border-gold/70">
        <span className="absolute -bottom-[3px] -start-[3px] h-1.5 w-1.5 rounded-full bg-gold" />
      </div>
      <div className="pointer-events-none absolute bottom-3.5 end-3.5 h-4 w-4 border-b-2 border-e-2 border-gold/70">
        <span className="absolute -bottom-[3px] -end-[3px] h-1.5 w-1.5 rounded-full bg-gold" />
      </div>
    </>
  )
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const { locale } = useApp()

  const localizedAtelier = {
    ar: {
      location: 'نواكشوط • دار الخياطة والتصميم الرفيع',
      heritage: 'فخامة الداراعة الموريتانية الأصيلة • كولكشن نخبوي',
      backHome: '← العودة للمتجر',
    },
    fr: {
      location: 'NOUAKCHOTT • ATELIER DE HAUTE COUTURE',
      heritage: 'Prestige de la Daraa Traditionnelle Mauritanienne',
      backHome: '← Retour à la boutique',
    },
    en: {
      location: 'NOUAKCHOTT • BESPOKE ATELIER & COUTURE',
      heritage: 'Authentic Mauritanian Daraa Heritage & Grandeur',
      backHome: '← Back to Store',
    },
  }[locale]

  return (
    <div className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-8 sm:px-6 lg:py-14 overflow-hidden">
      {/* --- ILLUMINATED REAL DARAA BACKGROUND --- */}
      <GrandDaraaBackdrop />

      {/* --- TOP LANGUAGE & CONTROLS BAR (Doğrudan Ekranın Üstünde Belirgin Dil ve Tema Seçici) --- */}
      <div className="relative z-20 mb-4 flex w-full max-w-lg items-center justify-between px-1">
        <Link
          to="/"
          className="font-sans text-xs text-cream-card/80 hover:text-gold transition-colors flex items-center gap-1 drop-shadow"
        >
          {localizedAtelier.backHome}
        </Link>

        <div className="flex items-center gap-2">
          {/* Explicit Language Selector: عربي | FR | EN */}
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>

      {/* --- CENTERED FLOATING GLASS CARD --- */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg rounded-brand border border-gold/50 bg-cream-card/92 dark:bg-[#181410]/94 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_50px_rgba(160,116,52,0.25)] backdrop-blur-2xl sm:p-10"
      >
        <TailorCornerMarks />

        {/* Brand Header & Wordmark Plate */}
        <div className="text-center">
          <div className="inline-block rounded-brand border border-gold/40 bg-cream/95 dark:bg-[#201c15] px-4 py-2 shadow-sm">
            <Wordmark compact />
          </div>

          <p className="mt-4 font-sans text-[10px] uppercase tracking-[0.28em] text-gold">
            {localizedAtelier.location}
          </p>

          <GoldStitchDivider className="mx-auto my-3.5 max-w-[240px]" />

          <h1 className="font-display text-2xl font-normal text-ink sm:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 font-text text-xs text-ink/70 sm:text-sm">{subtitle}</p>
          )}
        </div>

        {/* Form Body */}
        <div className="mt-6">{children}</div>

        {/* Bottom subtle provenance stamp */}
        <div className="mt-8 border-t border-line/50 pt-4 text-center font-sans text-[10px] uppercase tracking-[0.2em] text-ink/40">
          <span>{localizedAtelier.heritage}</span>
        </div>
      </motion.div>
    </div>
  )
}
