'use client';
import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useApprovalStore } from '@/store/approvalStore';

export default function ApprovalsPage() {
  const { currentUser } = useAuthStore();
  const { requests, updateApprovalStatus } = useApprovalStore();

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;
  if (!['SUPER_ADMIN', 'DEPARTMENT_MANAGER'].includes(currentUser.role)) {
    return <div className="p-6 text-red-500 font-bold">권한이 없습니다. 결재 권한자만 접근 가능합니다.</div>;
  }

  // Only show requests pending for this manager or super admin
  const pendingRequests = requests.filter(r => r.status === 'PENDING' && (currentUser.role === 'SUPER_ADMIN' || r.managerId === currentUser.id));
  const completedRequests = requests.filter(r => r.status !== 'PENDING' && (currentUser.role === 'SUPER_ADMIN' || r.managerId === currentUser.id));

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    updateApprovalStatus(id, action, currentUser.id, action === 'REJECTED' ? '반려됨' : '승인됨');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">대기 중인 결재</h1>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 text-sm font-semibold text-gray-600">결재 유형</th>
                <th className="p-4 text-sm font-semibold text-gray-600">요청 내역</th>
                <th className="p-4 text-sm font-semibold text-gray-600">사유</th>
                <th className="p-4 text-sm font-semibold text-gray-600">액션</th>
              </tr>
            </thead>
            <tbody>
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">대기 중인 결재가 없습니다.</td>
                </tr>
              ) : (
                pendingRequests.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{r.type}</td>
                    <td className="p-4 text-sm text-gray-800">{r.title}</td>
                    <td className="p-4 text-sm text-gray-500 max-w-xs truncate">{r.reason}</td>
                    <td className="p-4 space-x-2 flex">
                      <button onClick={() => handleAction(r.id, 'APPROVED')} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">승인</button>
                      <button onClick={() => handleAction(r.id, 'REJECTED')} className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700">반려</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">최근 처리 내역</h2>
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-4 text-sm font-semibold text-gray-600">제목</th>
                <th className="p-4 text-sm font-semibold text-gray-600">결과</th>
                <th className="p-4 text-sm font-semibold text-gray-600">코멘트</th>
              </tr>
            </thead>
            <tbody>
              {completedRequests.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-gray-500">처리 내역이 없습니다.</td>
                </tr>
              ) : (
                completedRequests.map(r => (
                  <tr key={r.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{r.title}</td>
                    <td className="p-4 text-sm font-bold">
                      <span className={r.status === 'APPROVED' ? 'text-green-600' : 'text-red-600'}>
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{r.reviewComment}</td>
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
