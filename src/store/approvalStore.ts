import { create } from 'zustand';
import { ApprovalRequest, ApprovalWorkflowTemplate, ApprovalRequestType } from '@/types/models';
import { mockApprovalRequests } from '@/data/mockData';

interface ApprovalState {
  requests: ApprovalRequest[];
  templates: ApprovalWorkflowTemplate[];
  addRequest: (request: Omit<ApprovalRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateApprovalStatus: (id: string, status: 'APPROVED' | 'REJECTED' | 'PM_APPROVED' | 'MANAGER_REVIEWING', reviewerId: string, comment?: string, alternativeType?: ApprovalRequestType) => void;
  updateTemplate: (templateId: string, updates: Partial<ApprovalWorkflowTemplate>) => void;
}

const initialRequests: ApprovalRequest[] = [
  ...mockApprovalRequests,
  {
    id: 'a1',
    type: 'SCHEDULE_APPROVAL',
    requestedBy: 'u4',
    managerId: 'u2',
    status: 'PENDING',
    title: '연장 근무 신청 (디자인 시안 마감)',
    reason: '금일 자정까지 디자인 시안 마무리 필요',
    requestedStartDate: '2026-07-07T18:00',
    requestedDueDate: '2026-07-07T21:00',
    createdAt: '2026-07-07T09:00:00Z',
    updatedAt: '2026-07-07T09:00:00Z'
  }
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

export const useApprovalStore = create<ApprovalState>((set) => ({
  requests: initialRequests,
  templates: initialTemplates,
  addRequest: (requestData) => set((state) => ({
    requests: [...state.requests, {
      ...requestData,
      id: `apr_${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]
  })),
  updateApprovalStatus: (id, status, reviewerId, comment, alternativeType) => set((state) => ({
    requests: state.requests.map(r => 
      r.id === id 
        ? { ...r, status, reviewedBy: reviewerId, reviewComment: comment, alternativeType, updatedAt: new Date().toISOString() }
        : r
    )
  })),
  updateTemplate: (templateId, updates) => set((state) => ({
    templates: state.templates.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    )
  }))
}));
