import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'
const ALLOWED_THEMES: Array<Theme> = ['light', 'dark', 'system']

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  init: () => void
}

let mediaQueryHandler: ((e: MediaQueryListEvent) => void) | null = null
let systemThemeHandler: ((e: MediaQueryListEvent) => void) | null = null

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)

  if (dark) root.classList.add('dark')
  else root.classList.remove('dark')
}

const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  setTheme: (theme: Theme) => {
    set({ theme })
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme', theme)
      } catch (e) {}
    }

    applyTheme(theme)

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')

      // Remove existing handler if present
      if (mediaQueryHandler) {
        try {
          mq.removeEventListener &&
            mq.removeEventListener('change', mediaQueryHandler)
        } catch (e) {}
        try {
          mq.removeListener && (mq.removeListener as any)(mediaQueryHandler)
        } catch (e) {}
      }

      // Create and store new handler
      mediaQueryHandler = () => applyTheme(get().theme)
      try {
        mq.addEventListener
          ? mq.addEventListener('change', mediaQueryHandler)
          : (mq.addListener as any)(mediaQueryHandler)
      } catch (e) {}
    }
  },

  init: () => {
    if (typeof window === 'undefined') return
    let stored: Theme | null = null
    try {
      const raw = localStorage.getItem('theme')
      if (raw && ALLOWED_THEMES.includes(raw as Theme)) {
        stored = raw as Theme
      }
    } catch (e) {
      stored = null
    }

    const theme: Theme = stored || 'system'
    set({ theme })

    applyTheme(theme)

    if (
      theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia
    ) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')

      // Remove existing handler if present
      if (systemThemeHandler) {
        try {
          mq.removeEventListener &&
            mq.removeEventListener('change', systemThemeHandler)
        } catch (e) {}
        try {
          mq.removeListener && (mq.removeListener as any)(systemThemeHandler)
        } catch (e) {}
      }

      // Create and store new handler
      systemThemeHandler = () => applyTheme(get().theme)
      try {
        mq.addEventListener
          ? mq.addEventListener('change', systemThemeHandler)
          : (mq.addListener as any)(systemThemeHandler)
      } catch (e) {}
    }
  },
}))

export default useThemeStore
