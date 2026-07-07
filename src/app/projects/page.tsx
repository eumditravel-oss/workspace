'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { Board, GroupByOption, BoardViewType } from '@/components/board/Board';
import { TaskStatus } from '@/types/models';

export default function ProjectBoardPage() {
  const { projects } = useProjectStore();
  const { tasks, updateTaskStatus, updateTaskAssignee, updateTaskPriority } = useTaskStore();
  const { currentUser, users } = useAuthStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('STATUS');
  const [viewType, setViewType] = useState<BoardViewType>('DETAILED');
  const [showPersonalSchedules, setShowPersonalSchedules] = useState(false);

  const applyPreset = (preset: string) => {
    if (preset === 'PIPELINE_ALL') {
      setViewType('PIPELINE');
      setGroupBy('STATUS');
    } else if (preset === 'ASSIGNEE_VIEW') {
      setViewType('DETAILED');
      setGroupBy('ASSIGNEE');
    } else if (preset === 'PRIORITY_VIEW') {
      setViewType('DETAILED');
      setGroupBy('PRIORITY');
    }
  };

  // Auto-select first accessible project
  useEffect(() => {
    if (!selectedProjectId && accessibleProjects.length > 0) {
      setSelectedProjectId(accessibleProjects[0].id);
    }
  }, [projects, currentUser]);

  if (!currentUser) return <div className="p-6">로그인이 필요합니다.</div>;

  const accessibleProjects = projects.filter(p => {
    if (currentUser.role === 'SUPER_ADMIN') return true;
    if (currentUser.role === 'DEPARTMENT_MANAGER') return p.departmentId === currentUser.departmentId;
    if (currentUser.role === 'PM') return p.pmId === currentUser.id;
    if (currentUser.role === 'WORKER') return true; // In real app, check assignment
    return false;
  });

  const projectTasks = tasks.filter(t => t.projectId === selectedProjectId);

  const handleMoveTask = (taskId: string, targetId: string, groupByKey: GroupByOption) => {
    if (groupByKey === 'STATUS') {
      updateTaskStatus(taskId, targetId as TaskStatus);
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
          <select
            className="border rounded-lg p-2 bg-white text-sm font-semibold text-blue-600 border-blue-200"
            onChange={(e) => applyPreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>🌟 프리셋 선택</option>
            <option value="PIPELINE_ALL">전체 파이프라인</option>
            <option value="ASSIGNEE_VIEW">작업자별 부하(Assignee)</option>
            <option value="PRIORITY_VIEW">우선순위별 현황</option>
          </select>

          <select
            className="border rounded-lg p-2 bg-gray-50 text-sm"
            value={viewType}
            onChange={(e) => setViewType(e.target.value as BoardViewType)}
          >
            <option value="DETAILED">상세 보드</option>
            <option value="PIPELINE">파이프라인 보드</option>
            <option value="COLLAB">협업 보드</option>
          </select>

          <select
            className="border rounded-lg p-2 bg-gray-50 text-sm"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as GroupByOption)}
          >
            <option value="STATUS">상태별 그룹</option>
            <option value="ASSIGNEE">담당자별 그룹</option>
            <option value="PRIORITY">우선순위별 그룹</option>
          </select>

          <select 
            className="border rounded-lg p-2 bg-gray-50 min-w-[200px]"
            value={selectedProjectId} 
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="" disabled>프로젝트 선택</option>
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
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border">
          조회할 프로젝트를 선택해주세요.
        </div>
      )}
    </div>
  );
}
