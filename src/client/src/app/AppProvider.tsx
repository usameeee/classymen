import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_LOCALE, LOCALES, LOCALE_DIRECTION } from '@shared/constants/locales'
import type { Locale } from '@shared/constants/locales'
import { MESSAGES } from '../i18n/dictionary'
import type { MessageKey } from '../i18n/dictionary'
import { AppContext } from './AppContext'
import type { Theme } from './AppContext'

const THEME_KEY = 'cmr:theme'
const LOCALE_KEY = 'cmr:locale'

function readTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY)
  return LOCALES.includes(stored as Locale) ? (stored as Locale) : DEFAULT_LOCALE
}

/** Provides theme (light/dark) and locale (ar/fr/en, RTL-aware) to the app. */
export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [locale, setLocale] = useState<Locale>(readLocale)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = LOCALE_DIRECTION[locale]
    localStorage.setItem(LOCALE_KEY, locale)
  }, [locale])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const t = useCallback((key: MessageKey) => MESSAGES[locale][key], [locale])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, locale, setLocale, t }),
    [theme, toggleTheme, locale, t],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
