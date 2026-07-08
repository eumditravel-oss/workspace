'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useApprovalStore } from '@/store/approvalStore';
import { ApprovalRequestType } from '@/types/models';

export default function ApprovalsPage() {
  const { currentUser, users } = useAuthStore();
  const { requests, updateApprovalStatus } = useApprovalStore();

  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;
  
  const isDeputyOf = (targetUserId?: string) => {
    if (!targetUserId) return false;
    const targetUser = users.find(u => u.id === targetUserId);
    return targetUser?.deputyApproverId === currentUser?.id;
  };

  const hasApprovalRights = ['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM'].includes(currentUser.role) || users.some(u => u.deputyApproverId === currentUser.id);
  if (!hasApprovalRights) {
    return <div className="py-10 text-center text-[var(--color-danger)] font-bold">권한이 없습니다. 결재 권한자(또는 대리 결재자)만 접근 가능합니다.</div>;
  }

  // Only show requests pending for this manager or super admin, or PM
  const pendingRequests = requests.filter(r => 
    (r.status === 'PENDING' && (r.pmId === currentUser.id || isDeputyOf(r.pmId))) ||
    (r.status === 'MANAGER_REVIEWING' && (r.managerId === currentUser.id || isDeputyOf(r.managerId))) ||
    (r.status === 'PENDING' && (r.managerId === currentUser.id || isDeputyOf(r.managerId)) && !r.pmId) || // No PM, goes straight to manager
    (currentUser.role === 'SUPER_ADMIN' && ['PENDING', 'MANAGER_REVIEWING'].includes(r.status))
  );
  
  const completedRequests = requests.filter(r => !['PENDING', 'MANAGER_REVIEWING'].includes(r.status));

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED', alternativeType?: ApprovalRequestType) => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    let comment = '';
    if (action === 'REJECTED' || alternativeType) {
      comment = window.prompt(action === 'REJECTED' ? '반려 사유를 필수로 입력해주세요.' : '대안 승인 사유를 입력해주세요.') || '';
      if (!comment) {
        alert('사유 입력은 필수입니다.');
        return;
      }
    }

    let nextStatus: 'APPROVED' | 'REJECTED' | 'MANAGER_REVIEWING' = action;
    
    const isPmApproval = req.pmId === currentUser.id || isDeputyOf(req.pmId);

    // If PM is approving, it goes to Manager
    if (action === 'APPROVED' && isPmApproval && req.managerId && req.status === 'PENDING') {
      nextStatus = 'MANAGER_REVIEWING';
      comment = comment || 'PM (또는 대리 결재자) 1차 승인';
    }

    updateApprovalStatus(id, nextStatus, currentUser.id, comment, alternativeType);
  };

  return (
    <div className="max-w-5xl w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">대기 중인 결재</h1>
        <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg)] border-b">
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">결재 유형</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">요청 내역</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">사유</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">액션</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-[var(--color-text-sub)]">대기 중인 결재가 없습니다.</td>
                </tr>
              ) : (
                pendingRequests.map(r => (
                  <tr key={r.id} className="border-b hover:bg-[var(--color-bg)]">
                    <td className="p-4 font-medium text-[var(--color-text-main)]">{r.type}</td>
                    <td className="p-4 text-sm text-[var(--color-text-main)]">{r.title}</td>
                    <td className="p-4 text-sm text-[var(--color-text-sub)] max-w-xs truncate">{r.reason}</td>
                    <td className="p-4 space-x-2 flex flex-wrap gap-2">
                      <button onClick={() => handleAction(r.id, 'APPROVED')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">승인</button>
                      <button onClick={() => handleAction(r.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">반려</button>
                      
                      {hasApprovalRights && (
                        <>
                          {r.type === 'OVERTIME_REQUEST' && (
                            <button onClick={() => handleAction(r.id, 'APPROVED', 'DEADLINE_EXTENSION')} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                              일정 연장으로 대안 승인
                            </button>
                          )}
                          {r.type === 'DEADLINE_EXTENSION' && (
                            <button onClick={() => handleAction(r.id, 'APPROVED', 'MANPOWER_SUPPORT')} className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700">
                              인력 지원으로 대안 승인
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">최근 처리 내역</h2>
        <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg)] border-b">
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">제목</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">결과</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">코멘트</th>
              </tr>
            </thead>
            <tbody>
              {completedRequests.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-[var(--color-text-sub)]">처리 내역이 없습니다.</td>
                </tr>
              ) : (
                completedRequests.map(r => (
                  <tr key={r.id} className="border-b hover:bg-[var(--color-bg)]">
                    <td className="p-4 font-medium text-[var(--color-text-main)]">{r.title}</td>
                    <td className="p-4 text-sm font-bold">
                      <span className={r.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>
                        {r.status} {r.alternativeType ? `(대안: ${r.alternativeType})` : ''}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-[var(--color-text-sub)]">{r.reviewComment}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
