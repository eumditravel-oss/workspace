import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useApprovalStore } from '@/store/approvalStore';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">휴가/개인 일정 등록</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">일정 구분</label>
            <select
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as 'OFF' | 'ETC')}
              className="w-full border rounded-lg p-2"
            >
              <option value="OFF">휴가 (연차/반차)</option>
              <option value="ETC">기타 개인 일정 (외근/교육 등)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 여름 휴가, 오후 반차"
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">상세 사유</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="상세 사유를 입력하세요 (선택)"
              className="w-full border rounded-lg p-2 h-24"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold"
            >
              결재 요청
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
