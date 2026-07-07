import { create } from 'zustand';
import { ApprovalRequest } from '@/types/models';
import { mockApprovalRequests } from '@/data/mockData';

interface ApprovalState {
  requests: ApprovalRequest[];
  updateApprovalStatus: (id: string, status: 'APPROVED' | 'REJECTED', reviewerId: string, comment?: string) => void;
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

export const useApprovalStore = create<ApprovalState>((set) => ({
  requests: initialRequests,
  updateApprovalStatus: (id, status, reviewerId, comment) => set((state) => ({
    requests: state.requests.map(r => 
      r.id === id 
        ? { ...r, status, reviewedBy: reviewerId, reviewComment: comment, updatedAt: new Date().toISOString() }
        : r
    )
  }))
}));
