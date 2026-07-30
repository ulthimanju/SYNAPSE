import { create } from 'zustand';
import { STORAGE_KEYS, THEMES } from '../config/constants';

const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || THEMES.LIGHT;
document.documentElement.setAttribute('data-theme', savedTheme);

export const useThemeStore = create((set) => ({
  theme: savedTheme,

  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme = state.theme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
      localStorage.setItem(STORAGE_KEYS.THEME, nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      return { theme: nextTheme };
    });
  },
}));
