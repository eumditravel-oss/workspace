import { create } from 'zustand';
import { TaskCard, TaskStatus } from '@/types/models';
import { mockTasks } from '@/data/mockData';

interface TaskState {
  tasks: TaskCard[];
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  requestTaskCompletion: (taskId: string, memo: string) => void;
  reviewTaskCompletion: (taskId: string, isApproved: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [...mockTasks],
  updateTaskStatus: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } 
        : t
    )
  })),
  requestTaskCompletion: (taskId, memo) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === taskId
        ? { 
            ...t, 
            status: 'REVIEW', 
            completionStatus: 'PM_REVIEWING', 
            description: t.description + `\n\n[완료 메모]\n${memo}`,
            updatedAt: new Date().toISOString() 
          }
        : t
    )
  })),
  reviewTaskCompletion: (taskId, isApproved) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: isApproved ? 'DONE' : 'IN_PROGRESS',
            completionStatus: isApproved ? 'COMPLETED' : 'REJECTED',
            updatedAt: new Date().toISOString()
          }
        : t
    )
  }))
}));
