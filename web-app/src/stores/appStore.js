import { create } from 'zustand';

export const useAppStore = create((set) => ({
  sidebarOpen: true,
  activeWorkspaceId: null,
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, { id: Date.now(), ...notification }] })),
  removeNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}));
