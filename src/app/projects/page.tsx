'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { Board, GroupByOption, BoardViewType } from '@/components/board/Board';
import { ProjectBoard } from '@/components/board/ProjectBoard';
import { ProjectPartBoard } from '@/components/board/ProjectPartBoard';
import { ProjectEvaluationModal } from '@/components/evaluation/ProjectEvaluationModal';
import { PostDeliveryWorkModal } from '@/components/delivery/PostDeliveryWorkModal';
import { PmDispatchModal } from '@/components/board/PmDispatchModal';
import { RevisionRequestModal } from '@/components/board/RevisionRequestModal';
import { TaskStatus, ProjectSourceType, Project } from '@/types/models';
import { DetailedLineStage, getProjectBoardColumn } from '@/lib/selectors';
import { canViewProject, canViewTask, canEditProject } from '@/lib/permissions';
import { FileText, ArrowLeft, ChevronRight, History, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export type ExtendedViewType = BoardViewType | 'PART' | 'HISTORY';

export default function ProjectBoardPage() {
  const projects = useProjectStore(state => state.projects);
  const revisionRequests = useProjectStore(state => state.revisionRequests);
  const postDeliveryWorkRequests = useProjectStore(state => state.postDeliveryWorkRequests);
  const { tasks, updateTaskStatus, updateDetailedLineStage, updateTaskAssignee, updateTaskPriority } = useTaskStore();
  const { currentUser, users } = useAuthStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('STATUS');
  const [viewType, setViewType] = useState<ExtendedViewType>('PART');
  const [showPersonalSchedules, setShowPersonalSchedules] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showPostDeliveryModal, setShowPostDeliveryModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [dispatchProject, setDispatchProject] = useState<Project | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<ProjectSourceType>('INTERNAL_DEVELOPMENT');

  const applyPreset = (preset: string) => {
    if (preset === 'ASSIGNEE_VIEW') {
      setViewType('DETAILED');
      setGroupBy('ASSIGNEE');
    } else if (preset === 'PRIORITY_VIEW') {
      setViewType('DETAILED');
      setGroupBy('PRIORITY');
    }
  };

  if (!currentUser) return <div className="py-10 text-center text-[var(--color-text-sub)]">로그인이 필요합니다.</div>;

  const accessibleProjects = projects.filter(p => {
    if (canViewProject(currentUser, p)) return true;
    if (currentUser.role === 'WORKER') {
      return tasks.some(t => t.projectId === p.id && t.assigneeId === currentUser.id && !t.isDeleted);
    }
    return false;
  });

  const filteredProjects = accessibleProjects.filter(p => {
    if (selectedMonth === 'ALL') return true;
    
    // Filter by tasks that overlap with the selected month
    const pTasks = tasks.filter(t => t.projectId === p.id && !t.isDeleted);
    return pTasks.some(t => {
      if (!t.startDate && !t.dueDate) return false;
      const start = t.startDate ? new Date(t.startDate) : new Date(t.dueDate!);
      const end = t.dueDate ? new Date(t.dueDate) : new Date(t.startDate!);
      
      const targetMonthStart = new Date(2026, selectedMonth - 1, 1);
      const targetMonthEnd = new Date(2026, selectedMonth, 0, 23, 59, 59);
      
      return start <= targetMonthEnd && end >= targetMonthStart;
    });
  }).filter(p => {
    const pSource = p.projectSourceType || 'CLIENT_ORDER';
    return pSource === activeTab;
  });

  // Auto-select removed to show Project Summary Board by default

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId && !t.isDeleted && canViewTask(currentUser, t));

  const handleMoveTask = (taskId: string, targetId: string, groupByKey: GroupByOption) => {
    if (groupByKey === 'STATUS') {
      if (viewType === 'DETAILED') {
        updateDetailedLineStage(taskId, targetId as DetailedLineStage);
      } else {
        updateTaskStatus(taskId, targetId as TaskStatus);
      }
    } else if (groupByKey === 'ASSIGNEE') {
      updateTaskAssignee(taskId, targetId === 'UNASSIGNED' ? undefined : targetId);
    } else if (groupByKey === 'PRIORITY') {
      updateTaskPriority(taskId, targetId as 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW');
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleProjectMove = (projectId: string, sourceColId: string, targetColId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    if (sourceColId === 'PRE_WORK' && targetColId === 'IN_PROGRESS') {
      const isAuthorized = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'DEPARTMENT_MANAGER' || (currentUser.role === 'PM' && project.pmId === currentUser.id);
      if (!isAuthorized) {
        alert("진행 중으로 전환할 권한이 없습니다. (담당 PM, 부서장, 최고 관리자만 가능)");
        return;
      }
      if (!project.pmId) {
        alert("PM이 먼저 배정되어야 업무를 하달할 수 있습니다.");
        return;
      }
      setDispatchProject(project);
    } else {
      if (!canEditProject(currentUser, project)) {
        alert("프로젝트 상태를 변경할 권한이 없습니다.");
        return;
      }
      
      // 일반 상태 변경
      const store = useProjectStore.getState();
      if (targetColId === 'IN_PROGRESS') store.updateProjectStatus(project.id, 'IN_PROGRESS');
      else if (targetColId === 'COMPLETED') store.updateProjectStatus(project.id, 'COMPLETED');
      else if (targetColId === 'PRE_WORK') store.updateProjectStatus(project.id, 'INTAKE_RECEIVED');
      else if (targetColId === 'REVISION') store.updateProjectStatus(project.id, 'REVISION_REQUESTED');
    }
  };

  return (
    <div className="w-full mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Unified Header matching Dashboard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {selectedProject ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSelectedProjectId('')}
                className="p-1.5 hover:bg-gray-100 rounded-md text-[var(--color-text-sub)] transition-colors"
                title="프로젝트 보드로 돌아가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight cursor-pointer hover:text-[var(--color-primary)] transition-colors" onClick={() => setSelectedProjectId('')}>
                프로젝트 보드
              </h1>
              <ChevronRight className="w-5 h-5 text-[var(--color-text-sub)] opacity-50" />
              <h1 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight truncate max-w-xs">
                {selectedProject.title}
              </h1>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[var(--color-text-main)] tracking-tight">프로젝트 보드</h1>
              <p className="text-[var(--color-text-sub)] text-sm mt-1 font-medium">
                {currentUser.departmentName || '본사'} 기준 전체 진행 현황
              </p>
            </>
          )}
        </div>
        
        {!selectedProjectId && (
          <div className="flex bg-gray-100/80 p-1 rounded-md border border-[var(--color-border)]">
            <button
              onClick={() => setActiveTab('INTERNAL_DEVELOPMENT')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-[4px] transition-colors ${activeTab === 'INTERNAL_DEVELOPMENT' ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border border-[var(--color-border)]/50' : 'text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]'}`}
            >
              개발팀 작업
            </button>
            <button
              onClick={() => setActiveTab('CLIENT_ORDER')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-[4px] transition-colors ${activeTab === 'CLIENT_ORDER' ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm border border-[var(--color-border)]/50' : 'text-[var(--color-text-sub)] hover:text-[var(--color-text-main)]'}`}
            >
              외부 수주 프로젝트
            </button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap items-center">
          {selectedProject && getProjectBoardColumn(selectedProject, new Date(), revisionRequests.some(r => r.projectId === selectedProject.id && (r.status === 'PENDING' || r.status === 'ACCEPTED'))) === 'COMPLETED' && currentUser.role !== 'SUPER_ADMIN' && (
            <button
              onClick={() => setShowPostDeliveryModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 font-semibold text-sm rounded-md border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              추가업무 요청
            </button>
          )}
          {selectedProject && getProjectBoardColumn(selectedProject, new Date(), revisionRequests.some(r => r.projectId === selectedProject.id && (r.status === 'PENDING' || r.status === 'ACCEPTED'))) === 'COMPLETED' && (
            <button
              onClick={() => setShowRevisionModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-700 font-semibold text-sm rounded-md border border-orange-200 hover:bg-orange-100 transition-colors"
            >
              <Wrench className="w-4 h-4" />
              수정(Revision) 요청
            </button>
          )}
          {currentUser.role === 'PM' && selectedProjectId && (
            <button
              onClick={() => setShowEvaluationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold text-sm rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <FileText className="w-4 h-4" />
              PM 평가 의견
            </button>
          )}
          
          <select 
            className="border border-[var(--color-border)] rounded-md px-3 py-1.5 bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-main)] shadow-sm outline-none focus:border-[var(--color-primary)] transition-colors"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          >
            <option value="ALL">전체 월 조회</option>
            {[6, 7, 8].map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>

          <select 
            className="border border-[var(--color-border)] rounded-md px-3 py-1.5 bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-main)] shadow-sm outline-none focus:border-[var(--color-primary)] transition-colors"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">(전체 프로젝트 요약 보기)</option>
            {filteredProjects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          
          {selectedProjectId && (
            <>
              <select 
                className="border border-[var(--color-border)] rounded-md px-3 py-1.5 bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-main)] shadow-sm outline-none focus:border-[var(--color-primary)] transition-colors" 
                value={viewType} 
                onChange={(e) => setViewType(e.target.value as ExtendedViewType)}
              >
                <option value="PART">파트별 보드 View</option>
                <option value="DETAILED">세부 공정 View</option>
                <option value="COLLAB">협업 보드 View</option>
                <option value="HISTORY">이력/결재 View</option>
              </select>
              {viewType !== 'PART' && viewType !== 'HISTORY' && (
                <select 
                  className="border border-[var(--color-border)] rounded-md px-3 py-1.5 bg-[var(--color-surface)] text-sm font-medium text-[var(--color-text-main)] shadow-sm outline-none focus:border-[var(--color-primary)] transition-colors" 
                  value={groupBy} 
                  onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
                >
                  <option value="STATUS">상태별 보기</option>
                  <option value="ASSIGNEE">담당자별 보기</option>
                  <option value="PRIORITY">우선순위(납품일)별 보기</option>
                </select>
              )}
            </>
          )}

          <button 
            onClick={() => setShowPersonalSchedules(!showPersonalSchedules)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md border shadow-sm transition-colors ${showPersonalSchedules ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-[var(--color-surface)] text-[var(--color-text-main)] border-[var(--color-border)] hover:bg-[var(--color-bg)]'}`}
          >
            개인일정 표기
          </button>
        </div>
      </div>

      {selectedProjectId ? (
        viewType === 'PART' ? (
          <ProjectPartBoard
            projectId={selectedProjectId}
            tasks={projectTasks}
            users={users}
          />
        ) : viewType === 'HISTORY' ? (
          <div className="bg-[var(--color-surface)] rounded-xl shadow-sm border p-6 min-h-[400px]">
            <h2 className="text-lg font-bold text-[var(--color-text-main)] mb-4">프로젝트 상세 이력</h2>
            <p className="text-sm text-[var(--color-text-sub)] mb-6">납품일 변경 이력, 추가업무 요청 이력 및 결재 AuditLog가 여기에 표시됩니다.</p>
            <div className="space-y-4">
              <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg)]">
                <h3 className="font-bold text-sm text-[var(--color-text-main)] mb-2">수정(Revision) 요청 이력</h3>
                {revisionRequests.filter(r => r.projectId === selectedProjectId).length === 0 ? (
                  <div className="text-xs text-[var(--color-text-sub)]">조회된 수정 내역이 없습니다.</div>
                ) : (
                  <ul className="space-y-2">
                    {revisionRequests.filter(r => r.projectId === selectedProjectId).map(req => (
                      <li key={req.id} className="bg-[var(--color-surface)] p-3 border rounded shadow-sm flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-[var(--color-text-main)]">{req.title}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant={req.status === 'RESOLVED' ? 'SUCCESS' : req.status === 'PENDING' ? 'WARNING' : 'DEFAULT'}>
                              {req.status}
                            </Badge>
                            {(req.status === 'PENDING' || req.status === 'ACCEPTED') && (
                              <button 
                                onClick={() => {
                                  useProjectStore.getState().updateRevisionRequestStatus(req.id, 'RESOLVED');
                                  alert('수정이 완료 처리되었습니다.');
                                }}
                                className="text-xs px-2 py-1 bg-green-50 text-green-700 font-bold rounded border border-green-200 hover:bg-green-100 transition-colors"
                              >
                                완료 처리
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-[var(--color-text-sub)]">{req.description}</p>
                        <div className="text-xs text-gray-400 mt-1">요청자: {req.requestedByClient} | {new Date(req.createdAt).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg)]">
                <h3 className="font-bold text-sm text-[var(--color-text-main)] mb-2">추가업무 요청 이력</h3>
                {postDeliveryWorkRequests.filter(r => r.projectId === selectedProjectId).length === 0 ? (
                  <div className="text-xs text-[var(--color-text-sub)]">조회된 이력이 없습니다.</div>
                ) : (
                  <ul className="space-y-2">
                    {postDeliveryWorkRequests.filter(r => r.projectId === selectedProjectId).map(req => (
                      <li key={req.id} className="bg-[var(--color-surface)] p-3 border rounded shadow-sm flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-[var(--color-text-main)]">{req.title}</span>
                          <Badge variant={req.status === 'APPROVED' ? 'SUCCESS' : req.status === 'REJECTED' ? 'ERROR' : 'DEFAULT'}>
                            {req.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-[var(--color-text-sub)]">{req.reason} | {new Date(req.createdAt).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg)]">
                <h3 className="font-bold text-sm text-[var(--color-text-main)] mb-2">납품일 변경 및 결재 이력</h3>
                <div className="text-xs text-[var(--color-text-sub)]">조회된 이력이 없습니다.</div>
              </div>
            </div>
          </div>
        ) : (
          <Board 
            tasks={projectTasks} 
            onMoveTask={handleMoveTask} 
            currentUser={currentUser} 
            viewType={viewType as BoardViewType}
            groupBy={groupBy}
            users={users}
          />
        )
      ) : (
        <ProjectBoard
          projects={filteredProjects}
          tasks={tasks}
          revisionRequests={revisionRequests}
          groupBy={groupBy}
          onProjectClick={setSelectedProjectId}
          onProjectMove={handleProjectMove}
        />
      )}

      {dispatchProject && (
        <PmDispatchModal
          project={dispatchProject}
          onClose={() => setDispatchProject(null)}
          onSuccess={() => setDispatchProject(null)}
        />
      )}

      {showEvaluationModal && selectedProjectId && (
        <ProjectEvaluationModal 
          projectId={selectedProjectId} 
          onClose={() => setShowEvaluationModal(false)} 
        />
      )}
      
      {showPostDeliveryModal && selectedProjectId && (
        <PostDeliveryWorkModal 
          projectId={selectedProjectId}
          onClose={() => setShowPostDeliveryModal(false)}
        />
      )}
      {showRevisionModal && selectedProjectId && (
        <RevisionRequestModal
          project={projects.find(p => p.id === selectedProjectId)!}
          onClose={() => setShowRevisionModal(false)}
        />
      )}
    </div>
  );
}
