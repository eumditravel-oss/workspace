import { create } from 'zustand';
import { PersonalSchedule } from '@/types/models';
import { fullSchedules } from '@/data/fullScheduleSeed';

interface ScheduleState {
  schedules: PersonalSchedule[];
  addSchedule: (schedule: Omit<PersonalSchedule, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'approvalStatus'>) => void;
  replaceSchedules: (schedules: PersonalSchedule[]) => void;
  resetSchedules: () => void;
}

const initialSchedules: PersonalSchedule[] = [
  ...fullSchedules,
  {
    id: 's1',
    userId: 'u4',
    ownerRole: 'WORKER',
    departmentId: 'd1',
    title: '디자인 컨퍼런스 참석',
    description: '코엑스 디자인 박람회 및 컨퍼런스 외근',
    scheduleType: 'PERSONAL_WORK',
    startDateTime: '2026-07-08T09:00:00Z',
    endDateTime: '2026-07-08T18:00:00Z',
    isAllDay: true,
    visibility: 'DEPARTMENT',
    status: 'SCHEDULED',
    createdBy: 'u4',
    updatedBy: 'u4',
    requiresApproval: true,
    approvalStatus: 'APPROVED',
    createdAt: '2026-07-07T09:00:00Z',
    updatedAt: '2026-07-07T09:00:00Z'
  }
];

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: initialSchedules,
  addSchedule: (scheduleData) => set((state) => ({
    schedules: [...state.schedules, {
      ...scheduleData,
      id: `s${Date.now()}`,
      status: 'SCHEDULED',
      approvalStatus: scheduleData.requiresApproval ? 'PENDING' : 'NOT_REQUIRED',
      updatedAt: new Date().toISOString()
    }]
  })),
  replaceSchedules: (schedules) => set({ schedules }),
  resetSchedules: () => set({ schedules: [] })
}));
