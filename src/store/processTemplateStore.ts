import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProcessTemplate, ProcessStage, ProcessTask, ProcessTemplateAssignment, ProcessSchedule } from '@/types/models';

interface ProcessTemplateState {
  templates: ProcessTemplate[];
  stages: ProcessStage[];
  tasks: ProcessTask[];
  assignments: ProcessTemplateAssignment[];
  schedules: ProcessSchedule[];
  
  // Initialize with some dummy data if needed
  loadInitialData: (templates: ProcessTemplate[], stages: ProcessStage[], tasks: ProcessTask[]) => void;
  
  // Assignment actions
  addAssignment: (assignment: Omit<ProcessTemplateAssignment, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAssignmentStatus: (id: string, status: ProcessTemplateAssignment['status']) => void;
  
  // Schedule actions
  addSchedule: (schedule: Omit<ProcessSchedule, 'id'>) => string;
  updateSchedule: (id: string, updates: Partial<ProcessSchedule>) => void;
  batchUpdateSchedules: (updates: { id: string; updates: Partial<ProcessSchedule> }[]) => void;
  
  replaceAssignments: (assignments: ProcessTemplateAssignment[]) => void;
  replaceSchedules: (schedules: ProcessSchedule[]) => void;
  reset: () => void;
}

export const useProcessTemplateStore = create<ProcessTemplateState>()(persist((set) => ({
  templates: [],
  stages: [],
  tasks: [],
  assignments: [],
  schedules: [],

  loadInitialData: (templates, stages, tasks) => set({ templates, stages, tasks }),

  addAssignment: (assignmentData) => {
    const newId = `pta_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      assignments: [...state.assignments, {
        ...assignmentData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    }));
    return newId;
  },

  updateAssignmentStatus: (id, status) => set((state) => ({
    assignments: state.assignments.map(a => 
      a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a
    )
  })),

  addSchedule: (scheduleData) => {
    const newId = `ps_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      schedules: [...state.schedules, {
        ...scheduleData,
        id: newId
      }]
    }));
    return newId;
  },

  updateSchedule: (id, updates) => set((state) => ({
    schedules: state.schedules.map(s => 
      s.id === id ? { ...s, ...updates } : s
    )
  })),

  batchUpdateSchedules: (updates) => set((state) => {
    const updatesMap = new Map(updates.map(u => [u.id, u.updates]));
    return {
      schedules: state.schedules.map(s => {
        const u = updatesMap.get(s.id);
        return u ? { ...s, ...u } : s;
      })
    };
  }),

  replaceAssignments: (assignments) => set({ assignments }),
  replaceSchedules: (schedules) => set({ schedules }),
  
  reset: () => set({
    templates: [],
    stages: [],
    tasks: [],
    assignments: [],
    schedules: []
  })
}), { name: 'process-template-storage' }));
