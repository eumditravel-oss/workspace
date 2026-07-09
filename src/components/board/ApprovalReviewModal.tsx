import React, { useState } from 'react';
import { ApprovalRequest } from '@/types/models';
import { useAuthStore } from '@/store/authStore';
import { useApprovalStore } from '@/store/approvalStore';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface Props {
  request: ApprovalRequest;
  onClose: () => void;
}

export const ApprovalReviewModal: React.FC<Props> = ({ request, onClose }) => {
  const { currentUser } = useAuthStore();
  const { updateApprovalStatus } = useApprovalStore();
  const [comment, setComment] = useState('');

  const handleApprove = () => {
    if (!currentUser) return;
    updateApprovalStatus(request.id, 'APPROVED', currentUser.id, comment);
    alert('승인 처리되었습니다.');
    onClose();
  };

  const handleReject = () => {
    if (!currentUser) return;
    if (!comment.trim()) {
      alert('반려 시에는 사유를 반드시 입력해야 합니다.');
      return;
    }
    updateApprovalStatus(request.id, 'REJECTED', currentUser.id, comment);
    alert('반려 처리되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onMouseDown={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg)]/50">
          <h2 className="text-lg font-bold text-[var(--color-text-main)]">결재 처리</h2>
          <button onClick={onClose} className="text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[var(--color-bg)] p-4 rounded-lg border border-[var(--color-border)] text-sm space-y-2">
            <div>
              <span className="text-[var(--color-text-sub)] block mb-1">신청 제목</span>
              <span className="font-bold text-[var(--color-text-main)]">{request.title}</span>
            </div>
            <div>
              <span className="text-[var(--color-text-sub)] block mb-1">상세 사유</span>
              <span className="text-[var(--color-text-main)] whitespace-pre-wrap">{request.reason}</span>
            </div>
            {request.requestedStartDate && request.requestedDueDate && (
              <div>
                <span className="text-[var(--color-text-sub)] block mb-1">희망 일정</span>
                <span className="text-blue-600 font-bold">{request.requestedStartDate} ~ {request.requestedDueDate}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">검토 의견 (선택)</label>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none min-h-[80px]"
              placeholder="승인/반려에 대한 추가 의견을 입력해주세요."
            />
          </div>
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 flex justify-end gap-3">
          <button onClick={handleReject} className="flex items-center gap-1 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg font-bold text-sm hover:bg-red-50 transition-colors">
            <XCircle className="w-4 h-4" /> 반려
          </button>
          <button onClick={handleApprove} className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-blue-700 transition-colors">
            <CheckCircle className="w-4 h-4" /> 승인
          </button>
        </div>
      </div>
    </div>
  );
};
