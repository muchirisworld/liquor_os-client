import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  init: () => void;
}

const applyTheme = (theme: Theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const dark = theme === 'dark' || (theme === 'system' && prefersDark);

  if (dark) root.classList.add('dark');
  else root.classList.remove('dark');
};

const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('theme', theme);
      } catch (e) {}
    }

    applyTheme(theme);

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme(get().theme);
      try { mq.removeEventListener && mq.removeEventListener('change', handler); } catch (e) {}
      try { mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler as any); } catch (e) {}
    }
  },

  init: () => {
    if (typeof window === 'undefined') return;
    let stored: Theme | null = null;
    try {
      stored = (localStorage.getItem('theme') as Theme) || null;
    } catch (e) {
      stored = null;
    }

    const theme: Theme = stored || 'system';
    set({ theme });

    applyTheme(theme);

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme(get().theme);
      try { mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler as any); } catch (e) {}
    }
  },
}));

export default useThemeStore;
