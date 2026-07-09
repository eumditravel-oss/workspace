import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ApprovalRequest, ApprovalWorkflowTemplate, ApprovalRequestType } from '@/types/models';
import { mockApprovalRequests } from '@/data/mockData';
import { useNotificationStore } from '@/store/notificationStore';
import { useTaskStore } from '@/store/taskStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useConflictStore } from '@/store/conflictStore';

interface ApprovalState {
  requests: ApprovalRequest[];
  templates: ApprovalWorkflowTemplate[];
  addRequest: (request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string }) => string;
  updateApprovalStatus: (id: string, status: 'APPROVED' | 'REJECTED' | 'PM_APPROVED' | 'MANAGER_REVIEWING', reviewerId: string, comment?: string, alternativeType?: ApprovalRequestType) => void;
  updateTemplate: (templateId: string, updates: Partial<ApprovalWorkflowTemplate>) => void;
  replaceRequests: (requests: ApprovalRequest[]) => void;
  resetRequests: () => void;
  replaceTemplates: (templates: ApprovalWorkflowTemplate[]) => void;
  resetTemplates: () => void;
}

const initialRequests: ApprovalRequest[] = [
  ...mockApprovalRequests
];

const initialTemplates: ApprovalWorkflowTemplate[] = [
  {
    id: 'tmpl_1',
    requestType: 'OVERTIME_REQUEST',
    isActive: true,
    steps: [
      { stepIndex: 1, role: 'PM', required: true },
      { stepIndex: 2, role: 'DEPARTMENT_MANAGER', required: true }
    ]
  },
  {
    id: 'tmpl_2',
    requestType: 'SCHEDULE_APPROVAL',
    isActive: true,
    steps: [
      { stepIndex: 1, role: 'DEPARTMENT_MANAGER', required: true }
    ]
  }
];

export const useApprovalStore = create<ApprovalState>()(persist((set) => ({
  requests: initialRequests,
  templates: initialTemplates,
  addRequest: (requestData) => {
    const newId = requestData.id || `apr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      requests: [...state.requests, {
        ...requestData,
        id: newId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]
    }));
    return newId;
  },
  updateApprovalStatus: (id, status, reviewerId, comment, alternativeType) => set((state) => {
    const request = state.requests.find(r => r.id === id);
    
    // Audit Log (Console)
    console.log(`[AUDIT] Approval Request ${id} status changed to ${status} by User ${reviewerId}. Comment: ${comment || 'N/A'}`);

    if (request && (status === 'APPROVED' || status === 'REJECTED')) {
      // Send Notification to requester
      useNotificationStore.getState().addNotification({
        userId: request.requestedBy,
        type: 'SYSTEM',
        title: `결재 ${status === 'APPROVED' ? '승인' : '반려'} 알림`,
        message: `요청하신 [${request.title}] 결재가 ${status === 'APPROVED' ? '승인' : '반려'} 처리되었습니다.\n검토자 의견: ${comment || '없음'}`,
        priority: status === 'REJECTED' ? 'HIGH' : 'NORMAL',
        relatedApprovalId: request.id
      });

      if (status === 'APPROVED' && request.taskId) {
        const taskStore = useTaskStore.getState();
        const task = taskStore.tasks.find(t => t.id === request.taskId);
        if (task) {
          if (request.type === 'DEADLINE_EXTENSION') {
            taskStore.updateTask(task.id, { dueDate: request.requestedDueDate || task.dueDate });
          } else if (request.type === 'OVERTIME_REQUEST') {
            const start = request.requestedStartDate || new Date().toISOString().split('T')[0];
            const end = request.requestedDueDate || new Date().toISOString().split('T')[0];
            taskStore.addWorkSegment({
              taskId: task.id,
              workerId: request.requestedBy,
              description: `[야근/초과근무 승인] ${request.title}`,
              startDate: start,
              endDate: end,
              progress: 0,
              status: 'APPROVED',
              isOvertime: true
            });
            
            // Check conflicts
            const overlapping = useScheduleStore.getState().schedules.filter(s => 
              s.userId === request.requestedBy && s.scheduleType === 'OFF' &&
              s.startDateTime.split('T')[0] <= end && s.endDateTime.split('T')[0] >= start
            );
            if (overlapping.length > 0) {
              useConflictStore.getState().addConflicts(overlapping.map(s => ({
                id: `c_${Date.now()}_${Math.random()}`,
                userId: request.requestedBy,
                startDate: s.startDateTime,
                endDate: s.endDateTime,
                conflictType: 'LEAVE_OVERLAP',
                relatedTaskIds: [task.id],
                relatedScheduleIds: [s.id],
                description: `휴가 일정과 야근/초과근무 일정이 겹칩니다.`,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              })));
            }
          } else if (request.type === 'SCHEDULE_REPLAN') {
            const start = request.requestedStartDate || new Date().toISOString().split('T')[0];
            const end = request.requestedDueDate || new Date().toISOString().split('T')[0];
            taskStore.addWorkSegment({
              taskId: task.id,
              workerId: request.requestedBy,
              description: `[세부일정 변경 승인] ${request.title}`,
              startDate: start,
              endDate: end,
              progress: 0,
              status: 'APPROVED',
              isOvertime: false
            });
            // If the replan exceeds original bounds, adjust them
            const newStart = request.requestedStartDate || task.startDate;
            const newEnd = request.requestedDueDate || task.dueDate;
            taskStore.updateTask(task.id, { startDate: newStart, dueDate: newEnd });
            
            // Check conflicts
            const overlapping = useScheduleStore.getState().schedules.filter(s => 
              s.userId === request.requestedBy && s.scheduleType === 'OFF' &&
              s.startDateTime.split('T')[0] <= end && s.endDateTime.split('T')[0] >= start
            );
            if (overlapping.length > 0) {
              useConflictStore.getState().addConflicts(overlapping.map(s => ({
                id: `c_${Date.now()}_${Math.random()}`,
                userId: request.requestedBy,
                startDate: s.startDateTime,
                endDate: s.endDateTime,
                conflictType: 'LEAVE_OVERLAP',
                relatedTaskIds: [task.id],
                relatedScheduleIds: [s.id],
                description: `휴가 일정과 세부 조정된 업무 일정이 겹칩니다.`,
                status: 'PENDING',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              })));
            }
          } else if (request.type === 'MANPOWER_SUPPORT') {
            taskStore.addTask({
              projectId: task.projectId,
              title: `[지원] ${task.title}`,
              description: `[인력 지원 요청 승인] ${request.reason}`,
              status: 'TODO',
              priority: task.priority,
              departmentId: task.departmentId,
              assigneeId: '', // Unassigned, PM to assign later
              startDate: request.requestedStartDate || task.startDate,
              dueDate: request.requestedDueDate || task.dueDate,
              orderIndex: task.orderIndex + 1,
              approvalStatus: 'APPROVED'
            });
          }
        }
      }
    }

    return {
      requests: state.requests.map(r => 
        r.id === id 
          ? { ...r, status, reviewedBy: reviewerId, reviewComment: comment, alternativeType, updatedAt: new Date().toISOString() }
          : r
      )
    };
  }),
  updateTemplate: (templateId, updates) => set((state) => ({
    templates: state.templates.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    )
  })),
  replaceRequests: (requests) => set({ requests }),
  resetRequests: () => set({ requests: [] }),
  replaceTemplates: (templates) => set({ templates }),
  resetTemplates: () => set({ templates: [] })
}), { name: 'approval-storage' }));
