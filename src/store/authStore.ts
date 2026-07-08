import { create } from 'zustand';
import { PersonnelCard } from '@/types/models';
import { mockUsers } from '@/data/mockData';

interface AuthState {
  currentUser: PersonnelCard | null;
  users: PersonnelCard[];
  appMode: 'DAILY_WORK' | 'ADMIN_VALIDATION';
  setAppMode: (mode: 'DAILY_WORK' | 'ADMIN_VALIDATION') => void;
  lastActivity: number;
  updateLastActivity: () => void;
  loginAs: (userId: string) => void;
  logout: () => void;
  updateUser: (userId: string, updates: Partial<PersonnelCard>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: mockUsers[0], // Default to Super Admin
  users: mockUsers,
  appMode: 'DAILY_WORK',
  lastActivity: Date.now(),
  setAppMode: (mode) => set({ appMode: mode }),
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
}));
