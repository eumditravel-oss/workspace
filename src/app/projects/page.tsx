'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { Board, GroupByOption, BoardViewType } from '@/components/board/Board';
import { ProjectBoard } from '@/components/board/ProjectBoard';
import { ProjectEvaluationModal } from '@/components/evaluation/ProjectEvaluationModal';
import { TaskStatus } from '@/types/models';
import { DetailedLineStage } from '@/lib/selectors';
import { FileText } from 'lucide-react';

export default function ProjectBoardPage() {
  const { projects } = useProjectStore();
  const { tasks, updateTaskStatus, updateDetailedLineStage, updateTaskAssignee, updateTaskPriority } = useTaskStore();
  const { currentUser, users } = useAuthStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('STATUS');
  const [viewType, setViewType] = useState<BoardViewType>('DETAILED');
  const [showPersonalSchedules, setShowPersonalSchedules] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);

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
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'DEPARTMENT_MANAGER') return p.departmentId === currentUser.departmentId;
    if (currentUser.role === 'PM') return p.pmId === currentUser.id;
    if (currentUser.role === 'WORKER') return true; // In real app, check assignment
    return false;
  });

  // Auto-select removed to show Project Summary Board by default

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800">프로젝트 보드</h1>
        <div className="flex gap-3 flex-wrap">
          {currentUser.role === 'PM' && selectedProjectId && (
            <button
              onClick={() => setShowEvaluationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 font-semibold text-sm rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors mr-2"
            >
              <FileText className="w-4 h-4" />
              PM 평가 의견
            </button>
          )}
          <select
            className="border rounded-lg p-2 bg-white text-sm font-semibold text-blue-600 border-blue-200"
            onChange={(e) => applyPreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>🌟 프리셋 선택</option>
            <option value="ASSIGNEE_VIEW">작업자별 부하(Assignee)</option>
            <option value="PRIORITY_VIEW">납품일 임박도 현황</option>
          </select>

          <select
            className="border rounded-lg p-2 bg-gray-50 text-sm"
            value={viewType}
            onChange={(e) => setViewType(e.target.value as BoardViewType)}
          >
            <option value="DETAILED">상세라인 보드</option>
            <option value="COLLAB">협업 보드</option>
          </select>

          <select
            className="border rounded-lg p-2 bg-gray-50 text-sm"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
          >
            <option value="STATUS">단계별 그룹</option>
            <option value="ASSIGNEE">담당자별 그룹</option>
            <option value="PRIORITY">납품일 임박도 그룹</option>
          </select>

          <select 
            className="border rounded-lg p-2 bg-gray-50 min-w-[200px]"
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">전체 프로젝트 뷰</option>
            {accessibleProjects.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border">
            <input 
              type="checkbox" 
              checked={showPersonalSchedules} 
              onChange={(e) => setShowPersonalSchedules(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            Off/Day 표시
          </label>
        </div>
      </div>

      {selectedProjectId ? (
        <Board 
          tasks={projectTasks} 
          onMoveTask={handleMoveTask} 
          currentUser={currentUser} 
          viewType={viewType}
          groupBy={groupBy}
          users={users}
        />
      ) : (
        <ProjectBoard
          projects={accessibleProjects}
          tasks={tasks}
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
    </div>
  );
}
