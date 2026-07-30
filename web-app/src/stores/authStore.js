import { create } from 'zustand';
import { STORAGE_KEYS } from '../config/constants';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),
  token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  loading: false,

  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (loading) => set({ loading }),
}));
