import React, { useState, useEffect } from 'react';
import { Project, TaskCard, LanguageCode } from '@/types/models';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useApprovalStore } from '@/store/approvalStore';
import { useAuditStore } from '@/store/auditStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { X, Plus, Trash2, AlertCircle, Languages, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { detectLanguage } from '@/lib/translation/detector';
import { executeTranslation } from '@/lib/translation/providers';

interface Props {
  project: Project;
  onClose: () => void;
  onSuccess: () => void;
}

export const PmDispatchModal: React.FC<Props> = ({ project, onClose, onSuccess }) => {
  const { users, currentUser } = useAuthStore();
  const { tasks: allTasks, addTask } = useTaskStore();
  const { updateProjectStatus } = useProjectStore();
  const { addNotification } = useNotificationStore();
  const { requests, addRequest } = useApprovalStore();
  const { addLog } = useAuditStore();
  const { schedules } = useScheduleStore();

  const pmUser = users.find(u => u.id === project.pmId);
  const activeUsers = users.filter(u => u.employmentStatus === 'ACTIVE');

  const rejectedRequest = requests
    .filter(r => r.projectId === project.id && r.type === 'SCHEDULE_APPROVAL' && r.status === 'REJECTED')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  const defaultInitialTask = {
    title: `${project.title} - 기본 공정`,
    description: '',
    scopeName: '기본 설계',
    assigneeId: '',
    priority: 'NORMAL' as const,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: project.targetDate || project.deliveryDate || new Date().toISOString().split('T')[0],
    estimatedHours: 8,
  };

  const getInitialTasks = () => {
    if (project.status === 'SCHEDULE_REJECTED' && rejectedRequest) {
      const rejectedTasks = allTasks.filter(t => t.approvalRequestId === rejectedRequest.id);
      if (rejectedTasks.length > 0) {
        return rejectedTasks.map(t => ({
          title: t.title,
          description: t.description,
          scopeName: t.scopeName,
          assigneeId: t.assigneeId,
          priority: t.priority as 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW',
          startDate: t.startDate,
          dueDate: t.dueDate,
          estimatedHours: t.estimatedHours || 8,
          titleI18n: t.titleI18n
        }));
      }
    }
    return [defaultInitialTask];
  };

  const [tasks, setTasks] = useState<Partial<TaskCard>[]>(getInitialTasks());

  const handleAddTask = () => {
    setTasks([...tasks, { ...defaultInitialTask, title: '' }]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateTask = (index: number, field: keyof TaskCard, value: any) => {
    const newTasks = [...tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    
    if (field === 'title') {
      const detected = detectLanguage(value as string);
      if (detected === 'ko' || detected === 'vi') {
        const i18n = newTasks[index].titleI18n || { originalLanguage: detected, originalText: value, translations: {} };
        i18n.originalLanguage = detected;
        i18n.originalText = value;
        newTasks[index].titleI18n = i18n;
      }
    }
    
    setTasks(newTasks);
  };

  const handleTranslate = async (index: number) => {
    const task = tasks[index];
    if (!task.title) return;
    
    const detected = detectLanguage(task.title);
    if (detected === 'UNKNOWN') {
      alert('언어를 감지할 수 없습니다. 한국어 또는 베트남어로 명확히 입력해주세요.');
      return;
    }

    const sourceLang = detected as LanguageCode;
    const targetLang: LanguageCode = sourceLang === 'ko' ? 'vi' : 'ko';

    const newTasks = [...tasks];
    if (!newTasks[index].titleI18n) {
      newTasks[index].titleI18n = { originalLanguage: sourceLang, originalText: task.title, translations: {} };
    }
    
    newTasks[index].titleI18n!.translations![targetLang] = {
      text: '번역 중...',
      status: 'NEEDS_TRANSLATION'
    };
    setTasks([...newTasks]);

    const result = await executeTranslation({ text: task.title, sourceLang, targetLang });
    
    const updatedTasks = [...tasks];
    updatedTasks[index].titleI18n!.translations![targetLang] = {
      text: result.text || '',
      status: result.status,
      provider: result.provider,
      errorMessage: result.errorMessage,
      translatedAt: new Date().toISOString()
    };
    setTasks(updatedTasks);
  };

  const checkWorkerOverload = (assigneeId: string, startDate: string, dueDate: string, addedHours: number) => {
    if (!assigneeId || !startDate || !dueDate) return { overloaded: false, offDays: false };

    // Check OFF days
    const userSchedules = schedules.filter(s => s.userId === assigneeId && s.scheduleType === 'OFF');
    const hasOffDays = userSchedules.some(s => {
      const sStart = s.startDateTime.split('T')[0];
      const sEnd = s.endDateTime.split('T')[0];
      return (startDate <= sEnd && dueDate >= sStart);
    });

    // Check workload
    // Simplified: Find tasks for this user overlapping the period.
    const overlappingTasks = allTasks.filter(t => 
      t.assigneeId === assigneeId && 
      t.status !== 'DONE' && 
      t.status !== 'REJECTED' &&
      t.approvalStatus !== 'REJECTED' &&
      t.startDate && t.dueDate &&
      (startDate <= t.dueDate && dueDate >= t.startDate)
    );
    
    let totalExistingHours = 0;
    overlappingTasks.forEach(t => {
      totalExistingHours += (t.estimatedHours || 8); // default to 8 if missing
    });

    // Rough check: if total > 40 per week or something. We just check if totalExistingHours + addedHours > 40
    // Actually, "일일 8시간 초과" means we should check days.
    const days = Math.max(1, (new Date(dueDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24) + 1);
    const avgDaily = (totalExistingHours + addedHours) / days;

    return {
      overloaded: avgDaily > 8,
      offDays: hasOffDays,
      avgDaily: avgDaily.toFixed(1)
    };
  };

  const validate = () => {
    if (tasks.length === 0) {
      alert('최소 1개 이상의 업무를 추가해야 합니다.');
      return false;
    }
    for (const t of tasks) {
      if (!t.title || !t.assigneeId || !t.startDate || !t.dueDate || !t.estimatedHours) {
        alert('모든 업무의 제목, 담당자, 시작/마감일, 소요시간을 입력해야 합니다.');
        return false;
      }
      if (t.startDate > t.dueDate) {
        alert('시작일은 마감일보다 늦을 수 없습니다.');
        return false;
      }
      const projectLimit = project.targetDate || project.deliveryDate;
      if (projectLimit && t.dueDate > projectLimit) {
        if (!window.confirm(`일부 업무의 마감일이 프로젝트의 최종 기한(${projectLimit})을 초과합니다. 계속하시겠습니까?`)) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    const reqTitle = `[${project.title}] PM 업무 배정 승인 요청`;
    const newApprovalRequestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    tasks.forEach((t, i) => {
      addTask({
        projectId: project.id,
        title: t.title!,
        description: t.description || '',
        scopeName: t.scopeName || '기본',
        status: 'TODO',
        priority: (t.priority as "URGENT" | "HIGH" | "NORMAL" | "LOW") || 'NORMAL',
        assigneeId: t.assigneeId,
        pmId: project.pmId,
        departmentId: project.departmentId,
        startDate: t.startDate,
        dueDate: t.dueDate,
        estimatedHours: t.estimatedHours,
        orderIndex: i,
        approvalStatus: 'PENDING',
        approvalRequestId: newApprovalRequestId,
        sourceType: project.projectSourceType === 'INTERNAL_DEVELOPMENT' ? 'INTERNAL_DEVELOPMENT_DISPATCH' : 'PM_DISPATCH',
        titleI18n: t.titleI18n
      });
    });

    updateProjectStatus(project.id, 'SCHEDULE_PENDING_APPROVAL');

    addRequest({
      id: newApprovalRequestId,
      type: 'SCHEDULE_APPROVAL',
      projectId: project.id,
      requestedBy: currentUser?.id || '',
      pmId: project.pmId,
      managerId: project.managerId,
      title: reqTitle,
      reason: project.status === 'SCHEDULE_REJECTED' ? '반려된 소요일정 재요청' : '업무 하달에 따른 소요일정 승인 요청',
    });

    if (project.managerId) {
      addNotification({
        userId: project.managerId,
        type: 'APPROVAL_REQUESTED',
        title: project.status === 'SCHEDULE_REJECTED' ? '일정 재승인 요청' : '신규 일정 승인 요청',
        message: reqTitle,
        priority: 'HIGH',
        relatedProjectId: project.id
      });
    }

    addLog({
      entityType: 'PROJECT',
      entityId: project.id,
      action: 'SCHEDULE_DRAFTED',
      actorId: currentUser?.id || '',
      message: 'PM 업무 배정 완료 및 중간관리자 승인 요청'
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] shadow-xl w-full max-w-[95vw] max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-bg)] rounded-t-xl">
          <h2 className="text-lg font-bold text-[var(--color-text-main)]">PM 업무 하달 (Task Dispatch)</h2>
          <button onClick={onClose} className="text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {project.status === 'SCHEDULE_REJECTED' && rejectedRequest && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800">이전 반려 사유</h4>
                <p className="text-sm text-red-700 mt-1">{rejectedRequest.reviewComment || '사유 없음'}</p>
              </div>
            </div>
          )}

          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-bold text-blue-900 mb-1">[{project.projectSourceType === 'CLIENT_ORDER' ? '외부 수주' : '개발팀 작업'}] {project.title}</div>
              <div className="text-blue-800 flex gap-4 mt-2">
                <span><span className="opacity-70">담당 PM:</span> {pmUser?.name || '미정'}</span>
                <span><span className="opacity-70">최종 기한:</span> {project.targetDate || project.deliveryDate || '미정'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[var(--color-text-main)]">세부 업무(Task) 생성 목록</h3>
              <button onClick={handleAddTask} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm font-semibold hover:bg-[var(--color-bg)] transition-colors">
                <Plus className="w-4 h-4" /> 업무 추가
              </button>
            </div>

            {tasks.map((task, idx) => {
              const workload = task.assigneeId && task.startDate && task.dueDate && task.estimatedHours
                ? checkWorkerOverload(task.assigneeId, task.startDate, task.dueDate, task.estimatedHours)
                : { overloaded: false, offDays: false, avgDaily: 0 };
                
              return (
                <div key={idx} className={`bg-[var(--color-bg)]/50 p-4 rounded-lg border ${workload.overloaded || workload.offDays ? 'border-orange-300' : 'border-[var(--color-border)]'} relative space-y-4 transition-colors`}>
                  {tasks.length > 1 && (
                    <button onClick={() => handleRemoveTask(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="col-span-2 md:col-span-2">
                      <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">업무명 *</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={task.title} 
                          onChange={(e) => handleUpdateTask(idx, 'title', e.target.value)}
                          className="w-full border rounded p-2 text-sm"
                          placeholder="업무명 입력"
                        />
                        <button
                          onClick={() => handleTranslate(idx)}
                          className="px-3 py-1 bg-[var(--color-bg-sub)] border border-[var(--color-border)] rounded hover:bg-gray-100 flex items-center gap-1 text-xs shrink-0"
                        >
                          <Languages className="w-4 h-4" /> 자동번역
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">담당 작업자 *</label>
                      <select 
                        value={task.assigneeId} 
                        onChange={(e) => handleUpdateTask(idx, 'assigneeId', e.target.value)}
                        className="w-full border rounded p-2 text-sm"
                      >
                        <option value="">담당자 선택</option>
                        {activeUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.departmentId})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">우선순위</label>
                      <select 
                        value={task.priority} 
                        onChange={(e) => handleUpdateTask(idx, 'priority', e.target.value)}
                        className="w-full border rounded p-2 text-sm"
                      >
                        <option value="URGENT">긴급</option>
                        <option value="HIGH">높음</option>
                        <option value="NORMAL">보통</option>
                        <option value="LOW">낮음</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">소요 시간(예상) *</label>
                      <input 
                        type="number" 
                        value={task.estimatedHours} 
                        onChange={(e) => handleUpdateTask(idx, 'estimatedHours', Number(e.target.value))}
                        className="w-full border rounded p-2 text-sm"
                        min="1"
                      />
                    </div>

                    <div className="col-span-2 md:col-span-2">
                      <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">시작 예정일 *</label>
                      <input 
                        type="date" 
                        value={task.startDate} 
                        onChange={(e) => handleUpdateTask(idx, 'startDate', e.target.value)}
                        className="w-full border rounded p-2 text-sm"
                      />
                    </div>
                    
                    <div className="col-span-2 md:col-span-3">
                      <label className="block text-xs font-bold text-[var(--color-text-sub)] mb-1">마감일 *</label>
                      <input 
                        type="date" 
                        value={task.dueDate} 
                        onChange={(e) => handleUpdateTask(idx, 'dueDate', e.target.value)}
                        className="w-full border rounded p-2 text-sm"
                      />
                    </div>
                  </div>

                  {(workload.overloaded || workload.offDays) && (
                    <div className="mt-2 text-xs p-2 bg-orange-50 text-orange-800 rounded border border-orange-200 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <div>
                        {workload.offDays && <span>해당 기간에 작업자의 휴가(OFF) 일정이 포함되어 있습니다. </span>}
                        {workload.overloaded && <span>기존 업무 포함 일일 평균 예상 부하가 8시간을 초과합니다 ({workload.avgDaily}h/day).</span>}
                      </div>
                    </div>
                  )}

                  {task.titleI18n && (
                    <div className="mt-2 text-xs p-2 bg-blue-50/50 rounded border border-blue-100/50">
                      <div className="text-gray-500 mb-1">
                        입력 언어: {task.titleI18n.originalLanguage === 'ko' ? '한국어 감지됨 · VI 번역 예정' : (task.titleI18n.originalLanguage === 'vi' ? '베트남어 감지됨 · KO 번역 예정' : '감지 불가')}
                      </div>
                      {Object.entries(task.titleI18n.translations || {}).map(([lang, trans]) => (
                        <div key={lang} className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-blue-800">{lang.toUpperCase()}:</span>
                          <span className={trans.status === 'TRANSLATION_FAILED' || trans.status === 'PROVIDER_LIMIT_EXCEEDED' ? 'text-red-500' : 'text-gray-700'}>
                            {trans.text || trans.errorMessage || '(번역 실패)'}
                          </span>
                          {trans.status === 'PROVIDER_LIMIT_EXCEEDED' && <span className="bg-orange-100 text-orange-700 px-1 py-0.5 rounded text-[10px]">한도 초과</span>}
                          {(trans.status === 'TRANSLATION_FAILED' || trans.status === 'PROVIDER_LIMIT_EXCEEDED') && (
                            <button onClick={() => handleTranslate(idx)} className="text-blue-500 hover:text-blue-700 ml-2">
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)] rounded-b-xl flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg font-bold text-sm bg-[var(--color-surface)] hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-bold text-sm shadow-sm hover:brightness-110 transition-all">
            {project.status === 'SCHEDULE_REJECTED' ? '업무 일정 재요청' : '업무 하달 및 진행 전환'}
          </button>
        </div>
      </div>
    </div>
  );
};
