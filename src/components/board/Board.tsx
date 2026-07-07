'use client';

import React from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { TaskCard, TaskStatus, PersonnelCard } from '@/types/models';
import { Column } from './Column';

interface BoardProps {
  tasks: TaskCard[];
  onMoveTask: (taskId: string, status: TaskStatus) => void;
  currentUser: PersonnelCard;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'TODO', title: '할 일' },
  { id: 'READY', title: '준비' },
  { id: 'IN_PROGRESS', title: '진행 중' },
  { id: 'REVIEW', title: '검토 요청' },
  { id: 'DONE', title: '완료' },
];

export const Board: React.FC<BoardProps> = ({ tasks, onMoveTask, currentUser }) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Permissions check
    if (currentUser.role === 'WORKER' && task.assigneeId !== currentUser.id) {
      alert('자신의 업무카드만 이동할 수 있습니다.');
      return;
    }

    if (task.status !== newStatus) {
      onMoveTask(taskId, newStatus);
    }
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <Column 
            key={col.id} 
            id={col.id} 
            title={col.title} 
            tasks={tasks.filter(t => t.status === col.id)} 
          />
        ))}
      </div>
    </DndContext>
  );
};
