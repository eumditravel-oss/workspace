import { create } from 'zustand';
import { TaskCard, TaskStatus } from '@/types/models';
import { mockTasks } from '@/data/mockData';

interface TaskState {
  tasks: TaskCard[];
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [...mockTasks],
  updateTaskStatus: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } 
        : t
    )
  }))
}));
