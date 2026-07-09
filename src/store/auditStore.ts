import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditLog } from '@/types/models';

interface AuditState {
  logs: AuditLog[];
  addLog: (log: Omit<AuditLog, 'id' | 'createdAt'>) => void;
  resetLogs: () => void;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) => set((state) => ({
        logs: [
          {
            ...log,
            id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date().toISOString()
          },
          ...state.logs
        ]
      })),
      resetLogs: () => set({ logs: [] })
    }),
    {
      name: 'audit-storage',
    }
  )
);
