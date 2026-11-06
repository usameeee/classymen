import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { Footer } from '../components/layout/Footer'
import { LuckyWheelModal } from '../components/gamification/LuckyWheelModal'
import { useApp } from '../app/useApp'

/** Public storefront shell: header, routed content and footer. */
export function StorefrontLayout() {
  const [wheelOpen, setWheelOpen] = useState(false)
  const { t } = useApp()

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {/* Floating Lucky Wheel Trigger Button */}
      <button
        type="button"
        onClick={() => setWheelOpen(true)}
        className="fixed bottom-6 start-6 z-40 flex items-center gap-2 rounded-full border border-gold/40 bg-ink px-4 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-gold shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-gold hover:bg-ink/95"
      >
        <span className="text-base">🎁</span>
        <span>{t('wheel.badge')}</span>
      </button>

      {wheelOpen && <LuckyWheelModal onClose={() => setWheelOpen(false)} />}
    </div>
  )
}
