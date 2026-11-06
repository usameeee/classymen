import { createContext } from 'react'
import type { Locale } from '@shared/constants/locales'
import type { MessageKey } from '../i18n/dictionary'

export type Theme = 'light' | 'dark'

export interface AppContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: MessageKey) => string
}

export const AppContext = createContext<AppContextValue | null>(null)
