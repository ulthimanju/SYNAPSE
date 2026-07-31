import { create } from 'zustand';

export const useAppStore = create((set) => ({
  sidebarOpen: true,
  activeWorkspaceId: null,
  workspaces: [],
  notifications: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setActiveWorkspaceId: (id) => set({ activeWorkspaceId: id }),
  setWorkspaces: (workspaces) => set({ workspaces }),
  addNotification: (notification) =>
    set((state) => ({ notifications: [...state.notifications, { id: Date.now(), ...notification }] })),
  removeNotification: (id) =>
    set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
}));
