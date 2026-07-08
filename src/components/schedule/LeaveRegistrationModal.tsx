import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useApprovalStore } from '@/store/approvalStore';
import { X, Calendar } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaveRegistrationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuthStore();
  const { addSchedule } = useScheduleStore();
  const { addRequest } = useApprovalStore();
  
  const [scheduleType, setScheduleType] = useState<'OFF' | 'ETC'>('OFF');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !title) {
      alert('필수 항목을 입력해주세요.');
      return;
    }

    const startDateTime = `${date}T00:00:00Z`;
    const endDateTime = `${date}T23:59:59Z`;

    // 1. Add schedule as PENDING
    addSchedule({
      userId: currentUser.id,
      ownerRole: currentUser.role,
      departmentId: currentUser.departmentId,
      title,
      description: reason,
      scheduleType,
      startDateTime,
      endDateTime,
      isAllDay: true,
      visibility: 'DEPARTMENT',
      requiresApproval: true,
    });

    // 2. Add approval request
    addRequest({
      type: 'SCHEDULE_APPROVAL',
      requestedBy: currentUser.id,
      managerId: currentUser.managerId,
      pmId: currentUser.pmId,
      title: `[${scheduleType === 'OFF' ? '휴가' : '기타 일정'}] ${title}`,
      reason,
      requestedStartDate: startDateTime,
      requestedDueDate: endDateTime
    });

    alert('일정 등록 및 결재 요청이 완료되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-[var(--color-surface)] rounded-[20px] shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
          <div className="flex items-center gap-2 text-indigo-700 font-bold">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg">휴가/개인 일정 등록</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-[var(--color-text-sub)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form id="leave-form" onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">일정 구분</label>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as 'OFF' | 'ETC')}
              className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            >
              <option value="OFF">휴가 (연차/반차)</option>
              <option value="ETC">기타 개인 일정 (외근/교육 등)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 여름 휴가, 오후 반차"
              className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">상세 사유</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="상세 사유를 입력하세요 (선택)"
              className="w-full border border-[var(--color-border-strong)] rounded-lg p-2.5 text-sm h-24 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
            />
          </div>
        </form>

        <div className="px-6 py-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[var(--color-border-strong)] bg-[var(--color-surface)] rounded-lg text-sm font-medium text-[var(--color-text-main)] hover:bg-[var(--color-bg)] transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            form="leave-form"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            결재 요청
          </button>
        </div>
      </div>
    </div>
  );
};

