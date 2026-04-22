import { create } from 'zustand';
import type { Subscription } from '@/types/database';

interface UserStore {
  // ── Estado ────────────────────────────────────────────────
  sidebarOpen: boolean;
  subscription: Subscription | null;

  // ── Acciones ──────────────────────────────────────────────
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSubscription: (subscription: Subscription | null) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  sidebarOpen: false,
  subscription: null,

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSubscription: (subscription) => set({ subscription }),
}));
