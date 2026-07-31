import { create } from 'zustand';
import { STORAGE_KEYS } from '../config/constants';
import { useAppStore } from './appStore';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null'),
  token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || null,
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  loading: false,

  setAuth: (user, token) => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    useAppStore.getState().resetAppStore();
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    useAppStore.getState().resetAppStore();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setLoading: (loading) => set({ loading }),
}));
