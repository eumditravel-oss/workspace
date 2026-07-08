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
import { TaskStatus, ProjectSourceType } from '@/types/models';
import { DetailedLineStage, getProjectBoardColumn } from '@/lib/selectors';
import { canViewProject, canViewTask } from '@/lib/permissions';
import { FileText, ArrowLeft, ChevronRight, History } from 'lucide-react';

export type ExtendedViewType = BoardViewType | 'PART' | 'HISTORY';

export default function ProjectBoardPage() {
  const { projects, postDeliveryWorkRequests, revisionRequests } = useProjectStore();
  const { tasks, updateTaskStatus, updateDetailedLineStage, updateTaskAssignee, updateTaskPriority } = useTaskStore();
  const { currentUser, users } = useAuthStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('STATUS');
  const [viewType, setViewType] = useState<ExtendedViewType>('PART');
  const [showPersonalSchedules, setShowPersonalSchedules] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showPostDeliveryModal, setShowPostDeliveryModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<ProjectSourceType>('CLIENT_ORDER');

  const applyPreset = (preset: string) => {
    if (preset === 'ASSIGNEE_VIEW') {
      setViewType('DETAILED');
      setGroupBy('ASSIGNEE');
    } else if (preset === 'PRIORITY_VIEW') {
      setViewType('DETAILED');
      setGroupBy('PRIORITY');
    }
  };

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;

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

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Breadcrumb & Header */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border">
        <div className="flex items-center gap-2">
          {selectedProject ? (
            <>
              <button 
                onClick={() => setSelectedProjectId('')}
                className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors"
                title="프로젝트 보드로 돌아가기"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-gray-800 cursor-pointer hover:text-indigo-600" onClick={() => setSelectedProjectId('')}>
                프로젝트 보드
              </h1>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <h1 className="text-lg font-bold text-indigo-600 truncate max-wxs">
                {selectedProject.title}
              </h1>
            </>
          ) : (
            <h1 className="text-lg font-bold text-gray-800">프로젝트 보드</h1>
          )}
        </div>
        
        {!selectedProjectId && (
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('CLIENT_ORDER')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'CLIENT_ORDER' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              외부 수주 프로젝트
            </button>
            <button
              onClick={() => setActiveTab('INTERNAL_DEVELOPMENT')}
              className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${activeTab === 'INTERNAL_DEVELOPMENT' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              개발팀 작업
            </button>
          </div>
        )}

        <div className="flex gap-2 flex-wrap items-center">
          {selectedProject && getProjectBoardColumn(selectedProject) === 'COMPLETED' && currentUser.role !== 'SUPER_ADMIN' && (
            <button
              onClick={() => setShowPostDeliveryModal(true)}
              className="flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 font-semibold text-xs rounded border border-purple-200 hover:bg-purple-100 transition-colors mr-1"
            >
              <FileText className="w-3 h-3" />
              추가업무 요청
            </button>
          )}
          {currentUser.role === 'PM' && selectedProjectId && (
            <button
              onClick={() => setShowEvaluationModal(true)}
              className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 font-semibold text-xs rounded border border-blue-200 hover:bg-blue-100 transition-colors mr-1"
            >
              <FileText className="w-3 h-3" />
              PM 평가 의견
            </button>
          )}
          <select
            className="border rounded px-2 py-1 bg-white text-xs font-semibold text-blue-600 border-blue-200"
            onChange={(e) => applyPreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>🌟 프리셋 선택</option>
            <option value="ASSIGNEE_VIEW">진행중인 프로젝트(Assignee)</option>
            <option value="PRIORITY_VIEW">납품일 임박도 현황</option>
          </select>

          <select 
            className="border rounded px-2 py-1 bg-gray-50 text-xs font-medium"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
          >
            <option value="ALL">전체 월</option>
            {[6, 7, 8].map(m => (
              <option key={m} value={m}>{m}월</option>
            ))}
          </select>

          <select 
            className="border rounded px-2 py-1 bg-gray-50 text-xs font-medium"
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
              <select className="border rounded px-2 py-1 bg-gray-50 text-xs font-medium" value={viewType} onChange={(e) => setViewType(e.target.value as ExtendedViewType)}>
                <option value="PART">파트별 보드 View</option>
                <option value="DETAILED">세부 공정 View</option>
                <option value="COLLAB">협업 보드 View</option>
                <option value="HISTORY">이력/결재 View</option>
              </select>
              {viewType !== 'PART' && viewType !== 'HISTORY' && (
                <select className="border rounded px-2 py-1 bg-gray-50 text-xs font-medium" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupByOption)}>
                  <option value="STATUS">상태별 보기</option>
                  <option value="ASSIGNEE">담당자별 보기</option>
                  <option value="PRIORITY">우선순위(납품일)별 보기</option>
                </select>
              )}
            </>
          )}

          <button 
            onClick={() => setShowPersonalSchedules(!showPersonalSchedules)}
            className={`px-3 py-1 text-xs font-semibold rounded ${showPersonalSchedules ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
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
          <div className="bg-white rounded-xl shadow-sm border p-6 min-h-[400px]">
            <h2 className="text-lg font-bold text-gray-800 mb-4">프로젝트 상세 이력</h2>
            <p className="text-sm text-gray-500 mb-6">납품일 변경 이력, 추가업무 요청 이력 및 결재 AuditLog가 여기에 표시됩니다.</p>
            <div className="space-y-4">
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-sm text-gray-700 mb-2">추가업무 요청 이력</h3>
                {postDeliveryWorkRequests.filter(r => r.projectId === selectedProjectId).length === 0 ? (
                  <div className="text-xs text-gray-500">조회된 이력이 없습니다.</div>
                ) : (
                  <ul className="space-y-2">
                    {postDeliveryWorkRequests.filter(r => r.projectId === selectedProjectId).map(req => (
                      <li key={req.id} className="bg-white p-3 border rounded shadow-sm flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-gray-800">{req.title}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{req.status}</span>
                        </div>
                        <div className="text-xs text-gray-600">{req.reason} | {new Date(req.createdAt).toLocaleString()}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <h3 className="font-bold text-sm text-gray-700 mb-2">납품일 변경 및 결재 이력</h3>
                <div className="text-xs text-gray-500">조회된 이력이 없습니다.</div>
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
    </div>
  );
}
