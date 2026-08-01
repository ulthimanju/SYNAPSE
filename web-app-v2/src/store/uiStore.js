import { create } from 'zustand';

/**
 * Zustand UI Store — STRICTLY LIMITED TO UI & LAYOUT STATE ONLY.
 * NEVER stores User, Session, JWT, Roles, Permissions, or API Responses.
 */
export const useUIStore = create((set) => ({
  // Theme state
  theme: localStorage.getItem('synapse_theme') || 'light',
  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('synapse_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { theme: nextTheme };
    }),

  // Sidebar & Navigation UI State
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Drawer UI State
  activeDrawer: null, // 'notifications' | 'settings' | 'collaborators' | null
  openDrawer: (drawerName) => set({ activeDrawer: drawerName }),
  closeDrawer: () => set({ activeDrawer: null }),

  // Modals UI State
  activeModal: null, // 'createWorkspace' | 'inviteCollaborator' | null
  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null }),

  // Command Palette UI State
  commandPaletteOpen: false,
  toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  // Layout Preferences
  viewMode: 'grid', // 'grid' | 'list'
  setViewMode: (mode) => set({ viewMode: mode }),
}));
