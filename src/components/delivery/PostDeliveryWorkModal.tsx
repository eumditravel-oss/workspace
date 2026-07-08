import React, { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { X } from 'lucide-react';

interface Props {
  projectId: string;
  onClose: () => void;
}

export const PostDeliveryWorkModal: React.FC<Props> = ({ projectId, onClose }) => {
  const { currentUser } = useAuthStore();
  const { addPostDeliveryWorkRequest } = useProjectStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [impactDeliveryDate, setImpactDeliveryDate] = useState(false);
  const [newSuggestedDeliveryDate, setNewSuggestedDeliveryDate] = useState('');

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !reason) {
      alert('제목과 사유를 입력해주세요.');
      return;
    }
    
    addPostDeliveryWorkRequest({
      projectId,
      requestedBy: currentUser.id,
      title,
      description,
      reason,
      estimatedHours,
      impactDeliveryDate,
      newSuggestedDeliveryDate: impactDeliveryDate ? newSuggestedDeliveryDate : undefined,
    });
    
    alert('사후 추가업무 요청이 제출되었습니다. PM 승인을 대기합니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-[var(--color-surface)] rounded-[20px] shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
          <h2 className="font-bold text-[var(--color-text-main)]">사후 추가업무 요청</h2>
          <button onClick={onClose} className="p-1.5 text-[var(--color-text-sub)] hover:text-[var(--color-text-sub)] rounded-full hover:bg-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
          <form id="post-delivery-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">제목 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-[var(--color-border-strong)] rounded p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                placeholder="추가 업무 제목"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">사유 <span className="text-red-500">*</span></label>
              <select 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full border border-[var(--color-border-strong)] rounded p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                required
              >
                <option value="">사유 선택</option>
                <option value="CLIENT_REQUEST">고객사 추가 요청</option>
                <option value="DEFECT_FIX">납품 후 결함 수정</option>
                <option value="SCOPE_CHANGE">요구사항 변경 반영</option>
                <option value="ETC">기타</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">상세 내용</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-[var(--color-border-strong)] rounded p-2 text-sm h-24 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                placeholder="상세 내용을 입력하세요"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">예상 소요 시간</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="0"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    className="w-full border border-[var(--color-border-strong)] rounded p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                  />
                  <span className="text-sm text-[var(--color-text-sub)]">시간</span>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-main)]">
                <input 
                  type="checkbox" 
                  checked={impactDeliveryDate}
                  onChange={(e) => setImpactDeliveryDate(e.target.checked)}
                  className="rounded border-[var(--color-border-strong)] text-indigo-600 focus:ring-indigo-500"
                />
                납품일 변경이 필요한가요?
              </label>
              
              {impactDeliveryDate && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-main)] mb-1">새로운 제안 납품일</label>
                  <input 
                    type="date" 
                    value={newSuggestedDeliveryDate}
                    onChange={(e) => setNewSuggestedDeliveryDate(e.target.value)}
                    className="w-full border border-[var(--color-border-strong)] rounded p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400"
                    required={impactDeliveryDate}
                  />
                </div>
              )}
            </div>
          </form>
        </div>
          
        <div className="px-6 py-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-[var(--color-text-sub)] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            취소
          </button>
          <button type="submit" form="post-delivery-form" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm">
            요청 제출
          </button>
        </div>
      </div>
    </div>
  );
};
