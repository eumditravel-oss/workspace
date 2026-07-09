import React, { useState } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { X, Wrench } from 'lucide-react';
import { Project } from '@/types/models';

interface Props {
  project: Project;
  onClose: () => void;
}

export const RevisionRequestModal: React.FC<Props> = ({ project, onClose }) => {
  const { currentUser } = useAuthStore();
  const addRevisionRequest = useProjectStore(state => state.addRevisionRequest);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!title.trim() || !description.trim()) {
      alert('제목과 상세 내용을 입력해주세요.');
      return;
    }

    addRevisionRequest({
      projectId: project.id,
      title,
      description,
      requestedByClient: currentUser?.name || 'Unknown',
    });

    console.log(`[AuditLog] User ${currentUser?.id} created RevisionRequest for project ${project.id}`);

    alert('수정(Revision) 요청이 접수되었습니다.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onMouseDown={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg)]/50">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-[var(--color-text-main)]">수정(Revision) 요청</h2>
          </div>
          <button onClick={onClose} className="text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-sub)]">대상 프로젝트</span>
              <span className="font-bold">{project.title}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">수정 요청 제목 *</label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              placeholder="예) 로그인 페이지 로고 변경"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">수정 요청 상세 내용 *</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-[var(--color-border)] rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none min-h-[100px]"
              placeholder="클라이언트가 요청한 구체적인 수정 내용을 입력해주세요."
            />
          </div>
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/50 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors">
            취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-orange-600 text-white rounded-lg font-bold text-sm shadow-sm hover:bg-orange-700 transition-colors">
            요청 등록
          </button>
        </div>
      </div>
    </div>
  );
};
