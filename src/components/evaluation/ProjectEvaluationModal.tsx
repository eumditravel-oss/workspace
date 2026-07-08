import React, { useState, useEffect } from 'react';
import { useEvaluationStore } from '@/store/evaluationStore';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { X, Save, FileText } from 'lucide-react';

interface ProjectEvaluationModalProps {
  projectId: string;
  onClose: () => void;
}

export const ProjectEvaluationModal: React.FC<ProjectEvaluationModalProps> = ({ projectId, onClose }) => {
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();
  const { projectContexts, saveProjectContext } = useEvaluationStore();
  
  const project = projects.find(p => p.id === projectId);
  
  const existingContext = projectContexts.find(
    c => c.projectId === projectId && c.evaluationPeriodId === 'default_period'
  );

  const [projectConditionSummary, setProjectConditionSummary] = useState(existingContext?.projectConditionSummary || '');
  const [scheduleDifficultyComment, setScheduleDifficultyComment] = useState(existingContext?.scheduleDifficultyComment || '');
  const [scopeDifficultyComment, setScopeDifficultyComment] = useState(existingContext?.scopeDifficultyComment || '');

  if (!project) return null;

  const handleSave = () => {
    saveProjectContext({
      evaluationPeriodId: 'default_period',
      projectId: project.id,
      pmId: project.pmId || currentUser?.id || 'UNKNOWN',
      departmentId: project.departmentId,
      projectConditionSummary,
      scheduleDifficultyComment,
      scopeDifficultyComment
    });
    alert('프로젝트 종합 의견이 저장되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-[var(--color-surface)] rounded-[20px] shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50">
          <div className="flex items-center gap-2 text-blue-800 font-bold">
            <FileText className="w-5 h-5" />
            <h3>PM 종합 의견 작성 (평가 참고용)</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-[var(--color-text-sub)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-2">
            <p className="text-sm text-blue-800">
              이 의견은 직접적인 평가 점수에 반영되지 않으나, <strong>QC팀이 프로젝트 상황을 이해하고 오류 내용 및 가중치를 검토할 수 있도록 돕기 위한 참고 자료</strong>입니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">프로젝트 종합 요약</label>
            <textarea 
              value={projectConditionSummary}
              onChange={(e) => setProjectConditionSummary(e.target.value)}
              placeholder="프로젝트 전반적인 진행 여건 및 특수성을 요약해주세요."
              rows={4}
              className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">일정 난이도 의견</label>
            <textarea 
              value={scheduleDifficultyComment}
              onChange={(e) => setScheduleDifficultyComment(e.target.value)}
              placeholder="촉박한 납기, 잦은 일정 변경 등 일정 관련 특이사항을 적어주세요."
              rows={3}
              className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[var(--color-text-main)] mb-1">범위/난이도 의견</label>
            <textarea 
              value={scopeDifficultyComment}
              onChange={(e) => setScopeDifficultyComment(e.target.value)}
              placeholder="고난이도 작업, 잦은 설계 변경 등 작업 난이도 관련 특이사항을 적어주세요."
              rows={3}
              className="w-full border rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            의견 저장
          </button>
        </div>
      </div>
    </div>
  );
};
