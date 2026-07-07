'use client';

import React, { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { Board } from '@/components/board/Board';

export default function ProjectBoardPage() {
  const { projects } = useProjectStore();
  const { tasks, updateTaskStatus } = useTaskStore();
  const { currentUser } = useAuthStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold text-gray-800">프로젝트 보드</h1>
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
      </div>

      {selectedProjectId ? (
        <Board tasks={projectTasks} onMoveTask={updateTaskStatus} currentUser={currentUser} />
      ) : (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl shadow-sm border">
          조회할 프로젝트를 선택해주세요.
        </div>
      )}
    </div>
  );
}
