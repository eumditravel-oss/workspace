import { create } from 'zustand';
import { ScheduleConflict, ConflictResolutionStatus } from '@/types/models';
import { useNotificationStore } from '@/store/notificationStore';

interface ConflictState {
  conflicts: ScheduleConflict[];
  addConflicts: (newConflicts: ScheduleConflict[]) => void;
  resolveConflict: (id: string, status: ConflictResolutionStatus, resolvedBy: string, comment?: string) => void;
}

export const useConflictStore = create<ConflictState>((set) => ({
  conflicts: [
    {
      id: 'c1',
      userId: 'u4',
      startDate: '2026-07-08',
      endDate: '2026-07-08',
      conflictType: 'LEAVE_OVERLAP',
      relatedTaskIds: ['1'],
      relatedScheduleIds: ['s1'],
      description: '휴가(외근) 일정과 [UI 디자인 시안] 작업 일정이 겹칩니다.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  addConflicts: (newConflicts) => set((state) => {
    const existingIds = state.conflicts.map(c => c.id);
    const uniqueNew = newConflicts.filter(c => !existingIds.includes(c.id));
    
    uniqueNew.forEach(c => {
      useNotificationStore.getState().addNotification({
        userId: c.userId,
        type: 'SYSTEM',
        title: '일정 충돌 감지',
        message: c.description,
        priority: 'CRITICAL'
      });
    });

    return { conflicts: [...state.conflicts, ...uniqueNew] };
  }),
  resolveConflict: (id, status, resolvedBy, comment) => set((state) => ({
    conflicts: state.conflicts.map(c => 
      c.id === id 
        ? { ...c, status, resolvedBy, resolutionComment: comment, updatedAt: new Date().toISOString() } 
        : c
    )
  }))
}));
