import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PersonnelCard, DataSourceMode } from '@/types/models';
import { mockUsers } from '@/data/mockData';

interface AuthState {
  currentUser: PersonnelCard | null;
  users: PersonnelCard[];
  appMode: 'DAILY_WORK' | 'ADMIN_VALIDATION';
  setAppMode: (mode: 'DAILY_WORK' | 'ADMIN_VALIDATION') => void;
  dataSourceMode: DataSourceMode;
  setDataSourceMode: (mode: DataSourceMode) => void;
  lastActivity: number;
  updateLastActivity: () => void;
  loginAs: (userId: string) => void;
  logout: () => void;
  updateUser: (userId: string, updates: Partial<PersonnelCard>) => void;
  replaceUsers: (users: PersonnelCard[]) => void;
  resetUsers: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: mockUsers[0], // Default to Super Admin
  users: mockUsers,
  appMode: 'DAILY_WORK',
  dataSourceMode: 'JSON_OPERATION_DATA',
  lastActivity: Date.now(),
  setAppMode: (mode) => set((state) => {
    // If switching to DAILY_WORK, ensure DEMO_SEED_DATA is deactivated
    if (mode === 'DAILY_WORK' && state.dataSourceMode === 'DEMO_SEED_DATA') {
      return { appMode: mode, dataSourceMode: 'JSON_OPERATION_DATA' };
    }
    return { appMode: mode };
  }),
  setDataSourceMode: (mode) => set((state) => {
    if (state.appMode === 'DAILY_WORK' && mode === 'DEMO_SEED_DATA') {
      console.warn("DEMO_SEED_DATA cannot be used in DAILY_WORK mode.");
      return state;
    }
    return { dataSourceMode: mode };
  }),
  updateLastActivity: () => set({ lastActivity: Date.now() }),
  loginAs: (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      // If switching to a user who is not admin, force DAILY_WORK mode
      if (!['SUPER_ADMIN', 'SYSTEM_ADMIN'].includes(user.role)) {
        set({ currentUser: user, appMode: 'DAILY_WORK', lastActivity: Date.now() });
      } else {
        set({ currentUser: user, lastActivity: Date.now() });
      }
    }
  },
  logout: () => set({ currentUser: null, appMode: 'DAILY_WORK' }),
  updateUser: (userId, updates) => set((state) => ({
    users: state.users.map(u => u.id === userId ? { ...u, ...updates } : u),
    currentUser: state.currentUser?.id === userId ? { ...state.currentUser, ...updates } : state.currentUser
  })),
      replaceUsers: (users) => set({ users }),
      resetUsers: () => set({ users: [], currentUser: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        appMode: state.appMode,
        dataSourceMode: state.dataSourceMode
      }),
    }
  )
);
