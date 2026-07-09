import React, { useState } from 'react';
import { useEvaluationStore } from '@/store/evaluationStore';
import { useAuthStore } from '@/store/authStore';
import { TaskCard } from '@/types/models';
import { X, Save, AlertTriangle } from 'lucide-react';

interface QcIssueModalProps {
  task: TaskCard;
  onClose: () => void;
}

export const QcIssueModal: React.FC<QcIssueModalProps> = ({ task, onClose }) => {
  const { currentUser } = useAuthStore();
  const { addQcIssue } = useEvaluationStore();

  const [issueStage, setIssueStage] = useState<'SUBMISSION_REVIEW' | 'FINAL_REVIEW' | 'DELIVERY_REVIEW' | 'POST_DELIVERY'>('SUBMISSION_REVIEW');
  const [issueType, setIssueType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [weightPercent, setWeightPercent] = useState<number>(25);

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      alert('오류 제목과 설명을 입력해주세요.');
      return;
    }

    addQcIssue({
      evaluationPeriodId: 'default_period', // MVP uses a default period
      projectId: task.projectId,
      taskId: task.id,
      assigneeId: task.assigneeId || 'UNKNOWN',
      reportedBy: currentUser?.id || 'UNKNOWN',
      issueStage,
      issueType: issueType || 'GENERAL',
      title,
      description,
      severity,
      weightPercent,
    });

    alert('QC 오류가 등록되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4" onMouseDown={onClose}>
      <div className="bg-[var(--color-surface)] rounded-[20px] shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-red-50">
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <AlertTriangle className="w-5 h-5" />
            <h3>QC 오류 등록</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-red-100 rounded-full transition-colors text-red-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">발견 단계</label>
            <select 
              value={issueStage} 
              onChange={(e) => setIssueStage(e.target.value as 'SUBMISSION_REVIEW' | 'FINAL_REVIEW' | 'DELIVERY_REVIEW' | 'POST_DELIVERY')}
              className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
            >
              <option value="SUBMISSION_REVIEW">제출자료 검토사항</option>
              <option value="FINAL_REVIEW">최종자료 검토사항</option>
              <option value="DELIVERY_REVIEW">납품전 검토</option>
              <option value="POST_DELIVERY">납품후 수정</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">오류 제목</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 치수 표기 누락"
              className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">오류 설명</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세한 오류 내용을 적어주세요."
              rows={3}
              className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">심각도</label>
              <select 
                value={severity} 
                onChange={(e) => setSeverity(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
              >
                <option value="LOW">LOW (경미)</option>
                <option value="MEDIUM">MEDIUM (보통)</option>
                <option value="HIGH">HIGH (심각)</option>
                <option value="CRITICAL">CRITICAL (매우 심각)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">QC 가중치 (%)</label>
              <select 
                value={weightPercent} 
                onChange={(e) => setWeightPercent(Number(e.target.value))}
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 bg-red-50"
              >
                <option value={100}>100% (1건당 1개 오류 반영)</option>
                <option value={50}>50% (2건당 1개 오류 반영)</option>
                <option value={25}>25% (4건당 1개 오류 반영)</option>
                <option value={10}>10% (10건당 1개 오류 반영)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-[var(--color-text-sub)] hover:bg-gray-200 rounded-lg transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            오류 확정 및 등록
          </button>
        </div>
      </div>
    </div>
  );
};
