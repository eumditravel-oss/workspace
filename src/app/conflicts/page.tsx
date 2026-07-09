'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useConflictStore } from '@/store/conflictStore';
import { ConflictResolutionStatus } from '@/types/models';

export default function ConflictsPage() {
  const { currentUser } = useAuthStore();
  const { conflicts, resolveConflict } = useConflictStore();

  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'DEPARTMENT_MANAGER', 'PM'].includes(currentUser.role)) {
    return <div className="py-10 text-center text-[var(--color-danger)] font-bold">권한이 없습니다. 관리자만 접근 가능합니다.</div>;
  }

  // Filter conflicts for this manager/PM
  // In a real app, we'd check if the conflict belongs to a user under this manager's department or PM's project
  const visibleConflicts = conflicts;
  const pendingConflicts = visibleConflicts.filter(c => c.status === 'PENDING');
  const resolvedConflicts = visibleConflicts.filter(c => c.status !== 'PENDING');

  const handleResolve = (id: string, resolution: ConflictResolutionStatus) => {
    const comment = window.prompt('해결 관련 코멘트나 사유를 입력하세요 (필수):');
    if (!comment) {
      alert('코멘트 입력은 필수입니다.');
      return;
    }
    resolveConflict(id, resolution, currentUser.id, comment);
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">일정 충돌 관리</h1>
        <p className="text-sm text-[var(--color-text-sub)] mb-6">신규 프로젝트 배정이나 일정 변경으로 발생한 충돌 내역을 확인하고 해결합니다.</p>
        
        <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border overflow-hidden mb-8">
          <div className="bg-red-50 p-4 border-b border-red-100 flex justify-between items-center">
            <h2 className="font-bold text-red-800">해결 대기 중인 충돌 ({pendingConflicts.length})</h2>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg)] border-b">
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">대상자</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">충돌 기간</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">유형</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">내용</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">액션</th>
              </tr>
            </thead>
            <tbody>
              {pendingConflicts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-[var(--color-text-sub)]">대기 중인 충돌 내역이 없습니다.</td>
                </tr>
              ) : (
                pendingConflicts.map(c => (
                  <tr key={c.id} className="border-b hover:bg-[var(--color-bg)]">
                    <td className="p-4 font-medium text-[var(--color-text-main)]">{c.userId}</td>
                    <td className="p-4 text-sm text-[var(--color-text-sub)]">{c.startDate} ~ {c.endDate}</td>
                    <td className="p-4 text-sm text-red-600 font-bold">{c.conflictType}</td>
                    <td className="p-4 text-sm text-[var(--color-text-main)]">{c.description}</td>
                    <td className="p-4 space-y-2">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => handleResolve(c.id, 'RESOLVED_OVERLAP_ALLOWED')} className="bg-gray-100 text-[var(--color-text-main)] px-3 py-1 rounded text-xs hover:bg-gray-200">중복 진행 허용</button>
                        <button onClick={() => handleResolve(c.id, 'RESOLVED_DELAYED')} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs hover:bg-blue-200">일정 미루기 승인</button>
                        <button onClick={() => handleResolve(c.id, 'RESOLVED_REASSIGNED')} className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs hover:bg-purple-200">담당자 재배정</button>
                        <button onClick={() => handleResolve(c.id, 'RESOLVED_OVERTIME_APPROVED')} className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-xs hover:bg-orange-200">야근 승인</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">해결 이력</h2>
        <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--color-bg)] border-b">
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">대상자 / 기간</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">내용</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">해결 상태</th>
                <th className="p-4 text-sm font-semibold text-[var(--color-text-sub)]">코멘트</th>
              </tr>
            </thead>
            <tbody>
              {resolvedConflicts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-[var(--color-text-sub)]">해결된 내역이 없습니다.</td>
                </tr>
              ) : (
                resolvedConflicts.map(c => (
                  <tr key={c.id} className="border-b hover:bg-[var(--color-bg)]">
                    <td className="p-4">
                      <div className="font-medium text-[var(--color-text-main)]">{c.userId}</div>
                      <div className="text-xs text-[var(--color-text-sub)]">{c.startDate} ~ {c.endDate}</div>
                    </td>
                    <td className="p-4 text-sm text-[var(--color-text-main)]">{c.description}</td>
                    <td className="p-4 text-sm font-bold text-green-600">
                      {c.status}
                    </td>
                    <td className="p-4 text-sm text-[var(--color-text-sub)]">{c.resolutionComment}</td>
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
