import { useThemeStore } from '../stores/themeStore';

export const useTheme = () => {
  const { theme, toggleTheme, setTheme } = useThemeStore();
  return { theme, toggleTheme, setTheme, isDark: theme === 'dark' };
};
