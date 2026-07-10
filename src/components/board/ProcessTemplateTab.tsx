import React, { useState } from 'react';
import { TaskCard } from '@/types/models';
import { useProcessTemplateStore } from '@/store/processTemplateStore';
import { useApprovalStore } from '@/store/approvalStore';
import { useAuthStore } from '@/store/authStore';
import { CalendarClock, Plus, Send, AlertCircle, RefreshCw } from 'lucide-react';

interface ProcessTemplateTabProps {
  task: TaskCard;
  isEditable: boolean;
}

export const ProcessTemplateTab: React.FC<ProcessTemplateTabProps> = ({ task, isEditable }) => {
  const { currentUser } = useAuthStore();
  const { templates, stages, tasks, assignments, schedules, addAssignment, addSchedule, updateSchedule } = useProcessTemplateStore();
  const { addRequest, requests } = useApprovalStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const taskAssignments = assignments.filter(a => a.taskId === task.id);
  const activeAssignment = taskAssignments.length > 0 ? taskAssignments[taskAssignments.length - 1] : undefined;
  const assignmentSchedules = activeAssignment ? schedules.filter(s => s.assignmentId === activeAssignment.id) : [];

  const rejectionRequest = requests
    .filter(r => r.taskId === task.id && r.status === 'REJECTED' && r.type === 'PROCESS_SCHEDULE_APPROVAL')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const rejectionComment = rejectionRequest?.reviewComment || '사유가 기재되지 않았습니다.';

  const handleApplyTemplate = () => {
    if (!selectedTemplateId || !currentUser) return;
    
    const assignmentId = addAssignment({
      taskId: task.id,
      templateId: selectedTemplateId,
      status: 'DRAFT',
      pmId: currentUser.id
    });

    const templateTasks = tasks.filter(t => {
      const stage = stages.find(s => s.id === t.stageId);
      return stage?.templateId === selectedTemplateId;
    });

    templateTasks.forEach(t => {
      addSchedule({
        assignmentId,
        processStageId: t.stageId,
        processTaskId: t.id,
        status: 'NOT_STARTED',
        progress: 0,
        category: '기본',
        isOfficial: false
      });
    });
  };

  const handleRequestApproval = () => {
    if (!activeAssignment || !currentUser) return;

    useProcessTemplateStore.getState().updateAssignmentStatus(activeAssignment.id, 'PENDING_APPROVAL');

    addRequest({
      type: 'PROCESS_SCHEDULE_APPROVAL',
      taskId: task.id,
      projectId: task.projectId,
      requestedBy: currentUser.id,
      title: `${task.title} 공정 일정 승인 요청`,
      reason: '작성된 세부 공정 일정표의 승인을 요청합니다.'
    });

    alert('중간관리자에게 승인을 요청했습니다.');
  };

  const handleReDraft = () => {
    if (!activeAssignment) return;
    useProcessTemplateStore.getState().updateAssignmentStatus(activeAssignment.id, 'DRAFT');
  };

  if (!activeAssignment) {
    return (
      <div className="space-y-4">
        <div className="bg-[var(--color-surface)] p-6 rounded-xl border border-[var(--color-border)] shadow-sm text-center">
          <CalendarClock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-[var(--color-text-main)] mb-2">공정 템플릿 미적용</h3>
          <p className="text-sm text-[var(--color-text-sub)] mb-6">
            이 업무에 적용된 공정 템플릿이 없습니다. 템플릿을 적용하여 세부 일정을 계획하세요.
          </p>
          
          <div className="flex justify-center items-center gap-2 max-w-sm mx-auto">
            <select 
              value={selectedTemplateId} 
              onChange={e => setSelectedTemplateId(e.target.value)}
              disabled={!isEditable}
              className="flex-1 border border-[var(--color-border)] bg-[var(--color-bg)] rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-50"
            >
              <option value="">템플릿 선택...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button 
              onClick={handleApplyTemplate}
              disabled={!isEditable || !selectedTemplateId}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-1 ${
                isEditable && selectedTemplateId ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Plus className="w-4 h-4" /> 적용
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Group schedules by stage for Card UI
  const stagesInSchedule = Array.from(new Set(assignmentSchedules.map(s => s.processStageId)));
  const sortedStages = stagesInSchedule
    .map(stageId => stages.find(s => s.id === stageId))
    .filter(Boolean)
    .sort((a, b) => (a!.orderIndex - b!.orderIndex));

  return (
    <div className="space-y-4">
      {activeAssignment.status === 'REJECTED' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
          <h4 className="text-red-800 font-bold flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4" /> 승인 반려됨
          </h4>
          <p className="text-sm text-red-700 mb-4 whitespace-pre-wrap">{rejectionComment}</p>
          {isEditable && (
            <button 
              onClick={handleReDraft}
              className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition flex items-center gap-1"
            >
              <RefreshCw className="w-4 h-4" /> 일정을 다시 수정하기 (Draft)
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-blue-600" /> 공정 일정표 (진행 중)
          </h3>
          <p className="text-xs text-[var(--color-text-sub)] mt-1">상태: <span className="font-bold">{activeAssignment.status}</span></p>
        </div>
        {(activeAssignment.status === 'DRAFT' || activeAssignment.status === 'REJECTED') && isEditable && (
          <button 
            onClick={handleRequestApproval}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition flex items-center gap-1"
          >
            <Send className="w-4 h-4" /> 승인 요청
          </button>
        )}
      </div>

      <div className="space-y-4">
        {sortedStages.map(stageObj => {
          if (!stageObj) return null;
          const stageSchedules = assignmentSchedules.filter(s => s.processStageId === stageObj.id);
          const isReadOnly = !isEditable || activeAssignment.status !== 'DRAFT';

          return (
            <div key={stageObj.id} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
              <div className="bg-[var(--color-bg)] border-b border-[var(--color-border)] p-3">
                <h4 className="font-bold text-[var(--color-text-main)] text-sm">{stageObj.name}</h4>
              </div>
              <div className="p-3 space-y-3">
                {stageSchedules.map(schedule => {
                  const taskObj = tasks.find(t => t.id === schedule.processTaskId);
                  return (
                    <div key={schedule.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 bg-[var(--color-bg)]/50 rounded-lg border border-[var(--color-border)]">
                      <div className="flex-1">
                        <span className="font-medium text-sm text-[var(--color-text-main)]">{taskObj?.name}</span>
                        {taskObj?.defaultAssigneeRole && (
                          <span className="ml-2 text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                            기본 할당: {taskObj.defaultAssigneeRole}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                          <label className="text-[10px] text-[var(--color-text-sub)] mb-0.5">시작일</label>
                          <input 
                            type="date" 
                            value={schedule.startDate || ''} 
                            onChange={e => updateSchedule(schedule.id, { startDate: e.target.value })}
                            disabled={isReadOnly}
                            className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </div>
                        <span className="text-gray-400 self-end mb-1.5">~</span>
                        <div className="flex flex-col">
                          <label className="text-[10px] text-[var(--color-text-sub)] mb-0.5">종료일</label>
                          <input 
                            type="date" 
                            value={schedule.endDate || ''} 
                            onChange={e => updateSchedule(schedule.id, { endDate: e.target.value })}
                            disabled={isReadOnly}
                            className="border border-[var(--color-border)] bg-[var(--color-surface)] rounded p-1.5 text-xs focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
