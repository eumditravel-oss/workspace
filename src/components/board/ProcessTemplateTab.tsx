import React, { useState } from 'react';
import { TaskCard } from '@/types/models';
import { useProcessTemplateStore } from '@/store/processTemplateStore';
import { useApprovalStore } from '@/store/approvalStore';
import { useAuthStore } from '@/store/authStore';
import { CalendarClock, Plus, Send } from 'lucide-react';

interface ProcessTemplateTabProps {
  task: TaskCard;
  isEditable: boolean;
}

export const ProcessTemplateTab: React.FC<ProcessTemplateTabProps> = ({ task, isEditable }) => {
  const { currentUser } = useAuthStore();
  const { templates, stages, tasks, assignments, schedules, addAssignment, addSchedule, updateSchedule } = useProcessTemplateStore();
  const { addRequest } = useApprovalStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const activeAssignment = assignments.find(a => a.taskId === task.id && a.status !== 'REJECTED');
  const assignmentSchedules = activeAssignment ? schedules.filter(s => s.assignmentId === activeAssignment.id) : [];

  const handleApplyTemplate = () => {
    if (!selectedTemplateId || !currentUser) return;
    
    // Create Assignment
    const assignmentId = addAssignment({
      taskId: task.id,
      templateId: selectedTemplateId,
      status: 'DRAFT',
      pmId: currentUser.id
    });

    // Create Schedules based on Template Tasks
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

    // Check if schedules have valid dates before approval if required
    // (Omitted strict validation for Phase 331 UI prototype)

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
              className="flex-1 border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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

  // Display Applied Template
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)] shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text-main)] flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-blue-600" /> 공정 일정표 (진행 중)
          </h3>
          <p className="text-xs text-[var(--color-text-sub)] mt-1">상태: <span className="font-bold">{activeAssignment.status}</span></p>
        </div>
        {activeAssignment.status === 'DRAFT' && isEditable && (
          <button 
            onClick={handleRequestApproval}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition flex items-center gap-1"
          >
            <Send className="w-4 h-4" /> 승인 요청
          </button>
        )}
      </div>

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-bg)] border-b">
            <tr>
              <th className="p-3 font-semibold text-[var(--color-text-main)] w-1/4">공정 단계</th>
              <th className="p-3 font-semibold text-[var(--color-text-main)] w-1/3">세부 업무명</th>
              <th className="p-3 font-semibold text-[var(--color-text-main)] w-1/6">시작일</th>
              <th className="p-3 font-semibold text-[var(--color-text-main)] w-1/6">종료일</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assignmentSchedules.map(schedule => {
              const taskObj = tasks.find(t => t.id === schedule.processTaskId);
              const stageObj = stages.find(s => s.id === schedule.processStageId);
              const isReadOnly = !isEditable || activeAssignment.status !== 'DRAFT';

              return (
                <tr key={schedule.id} className="hover:bg-[var(--color-bg)]/50 transition-colors">
                  <td className="p-3 font-medium text-[var(--color-text-main)]">{stageObj?.name}</td>
                  <td className="p-3 text-[var(--color-text-sub)]">{taskObj?.name}</td>
                  <td className="p-3">
                    <input 
                      type="date" 
                      value={schedule.startDate || ''} 
                      onChange={e => updateSchedule(schedule.id, { startDate: e.target.value })}
                      disabled={isReadOnly}
                      className="border rounded p-1.5 text-xs w-full disabled:bg-transparent disabled:border-transparent"
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      type="date" 
                      value={schedule.endDate || ''} 
                      onChange={e => updateSchedule(schedule.id, { endDate: e.target.value })}
                      disabled={isReadOnly}
                      className="border rounded p-1.5 text-xs w-full disabled:bg-transparent disabled:border-transparent"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
