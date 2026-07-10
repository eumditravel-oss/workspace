import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SidebarMode = 'EXPANDED' | 'COMPACT' | 'MINI';

interface UiState {
  sidebarMode: SidebarMode;
  isDarkMode: boolean;
  setSidebarMode: (mode: SidebarMode) => void;
  cycleSidebarMode: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarMode: 'EXPANDED',
      isDarkMode: false,
      setSidebarMode: (mode) => set({ sidebarMode: mode }),
      cycleSidebarMode: () => set((state) => {
        if (state.sidebarMode === 'EXPANDED') return { sidebarMode: 'COMPACT' };
        if (state.sidebarMode === 'COMPACT') return { sidebarMode: 'MINI' };
        return { sidebarMode: 'EXPANDED' };
      }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
    }),
    {
      name: 'ui-storage',
    }
  )
);
