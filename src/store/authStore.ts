import { create } from 'zustand';
import { PersonnelCard } from '@/types/models';
import { mockUsers } from '@/data/mockData';

interface AuthState {
  currentUser: PersonnelCard | null;
  users: PersonnelCard[];
  loginAs: (userId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: mockUsers[0], // Default to Super Admin
  users: mockUsers,
  loginAs: (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) set({ currentUser: user });
  },
  logout: () => set({ currentUser: null }),
}));
