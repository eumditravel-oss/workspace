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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-800">사후 추가업무 요청</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">제목 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="추가 업무 제목"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">사유 <span className="text-red-500">*</span></label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">상세 내용</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 text-sm h-24"
              placeholder="상세 내용을 입력하세요"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예상 소요 시간</label>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  min="0"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                />
                <span className="text-sm text-gray-500">시간</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input 
                type="checkbox" 
                checked={impactDeliveryDate}
                onChange={(e) => setImpactDeliveryDate(e.target.checked)}
                className="rounded border-gray-300"
              />
              납품일 변경이 필요한가요?
            </label>
            
            {impactDeliveryDate && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">새로운 제안 납품일</label>
                <input 
                  type="date" 
                  value={newSuggestedDeliveryDate}
                  onChange={(e) => setNewSuggestedDeliveryDate(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 text-sm"
                  required={impactDeliveryDate}
                />
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-end gap-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200">
              취소
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700">
              요청 제출
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
