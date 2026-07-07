import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarMode = 'EXPANDED' | 'COMPACT' | 'MINI';

interface UiState {
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
  cycleSidebarMode: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarMode: 'EXPANDED',
      setSidebarMode: (mode) => set({ sidebarMode: mode }),
      cycleSidebarMode: () => set((state) => {
        if (state.sidebarMode === 'EXPANDED') return { sidebarMode: 'COMPACT' };
        if (state.sidebarMode === 'COMPACT') return { sidebarMode: 'MINI' };
        return { sidebarMode: 'EXPANDED' };
      })
    }),
    {
      name: 'ui-storage',
    }
  )
);
