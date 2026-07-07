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
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>('ALL');

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
    <div className="max-w-7xl mx-auto space-y-4">
      <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border">
        <h1 className="text-lg font-bold text-gray-800">프로젝트 보드</h1>
        <div className="flex gap-2 flex-wrap items-center">
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
              <select className="border rounded px-2 py-1 bg-gray-50 text-xs font-medium" value={viewType} onChange={(e) => setViewType(e.target.value as BoardViewType)}>
                <option value="DETAILED">세부 공정 View</option>
                <option value="COLLAB">협업 보드 View</option>
              </select>
              <select className="border rounded px-2 py-1 bg-gray-50 text-xs font-medium" value={groupBy} onChange={(e) => setGroupBy(e.target.value as GroupByOption)}>
                <option value="STATUS">상태별 보기</option>
                <option value="ASSIGNEE">담당자별 보기</option>
                <option value="PRIORITY">우선순위(납품일)별 보기</option>
              </select>
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
          projects={filteredProjects}
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
