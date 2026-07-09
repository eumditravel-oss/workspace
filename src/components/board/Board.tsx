'use client';

import React from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { TaskCard, TaskStatus, PersonnelCard } from '@/types/models';
import { getUserDisplayName } from '@/lib/localization';
import { Column } from './Column';
import { TaskDetailModal } from './TaskDetailModal';
import { useProjectStore } from '@/store/projectStore';
import { getDeliveryUrgencyBucket, getDetailedLineStage } from '@/lib/selectors';

export type BoardViewType = 'DETAILED' | 'COLLAB' | 'MONTHLY';
export type GroupByOption = 'STATUS' | 'ASSIGNEE' | 'PRIORITY';

interface BoardProps {
  tasks: TaskCard[];
  onMoveTask: (taskId: string, targetId: string, groupByKey: GroupByOption) => void;
  currentUser: PersonnelCard;
  viewType?: BoardViewType;
  groupBy?: GroupByOption;
  users?: PersonnelCard[];
}

const DETAILED_COLUMNS = [
  { id: 'WAITING', title: '작업 착수 대기' },
  { id: 'QC_PM_START', title: 'QC/PM작업착수' },
  { id: 'IN_PROGRESS', title: '진행중' },
  { id: 'PM_REVIEW', title: 'PM검토' },
  { id: 'QC_REVIEW', title: 'QC검토' },
  { id: 'DONE', title: '완료' },
];

const COLLAB_COLUMNS = [
  { id: 'TODO', title: '📥 수주/대기' },
  { id: 'READY', title: '🇰🇷 CONCOST' },
  { id: 'IN_PROGRESS', title: '🇻🇳 VIET_QS' },
  { id: 'REVIEW', title: '🔎 QC/검수' },
  { id: 'DONE', title: '✅ 완료' },
];

export const Board: React.FC<BoardProps> = ({ tasks, onMoveTask, currentUser, viewType = 'DETAILED', groupBy = 'STATUS', users = [] }) => {
  const [selectedTask, setSelectedTask] = React.useState<TaskCard | null>(null);

  const getColumns = () => {
    if (groupBy === 'STATUS') {
      return viewType === 'COLLAB' ? COLLAB_COLUMNS : DETAILED_COLUMNS;
    }
    if (groupBy === 'PRIORITY') {
      return [
        { id: 'WITHIN_1_WEEK', title: '🔴 납품 1주일 전' },
        { id: 'WITHIN_2_WEEKS', title: '🟠 납품 2주일 전' },
        { id: 'WITHIN_1_MONTH', title: '🔵 납품 1달 전' },
        { id: 'UNSET', title: '⚪ 미정' },
      ];
    }
    if (groupBy === 'ASSIGNEE') {
      const assigneeCols = users.map(u => ({ id: u.id, title: getUserDisplayName(u) }));
      return [{ id: 'UNASSIGNED', title: '미배정' }, ...assigneeCols];
    }
    return DETAILED_COLUMNS;
  };

  const columns = getColumns();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const targetId = over.id as string;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Permissions check
    if (currentUser.role === 'WORKER') {
      if (groupBy === 'ASSIGNEE') {
        alert('작업자는 타인에게 업무를 배정할 수 없습니다.');
        return;
      }
      if (task.assigneeId !== currentUser.id) {
        alert('자신의 업무카드만 이동할 수 있습니다.');
        return;
      }
    }

    // Workflow transition validation (prevent skipping stages)
    if (groupBy === 'STATUS' && viewType === 'DETAILED') {
      const currentStage = getDetailedLineStage(task);
      const stageOrder: Record<string, number> = {
        WAITING: 0,
        QC_PM_START: 1,
        IN_PROGRESS: 2,
        PM_REVIEW: 3,
        QC_REVIEW: 4,
        DONE: 5
      };

      const currentIdx = stageOrder[currentStage];
      const newIdx = stageOrder[targetId];

      if (newIdx !== undefined && currentIdx !== undefined && newIdx > currentIdx + 1) {
        alert('공정 단계를 건너뛰어 이동할 수 없습니다.');
        return;
      }
    }

    onMoveTask(taskId, targetId, groupBy);
  };

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex space-x-6 overflow-x-auto pb-6 p-2 custom-scrollbar">
        {columns.map(col => {
          const colTasks = tasks.filter(t => {
            if (groupBy === 'STATUS') {
              if (viewType === 'COLLAB') return t.status === col.id;
              return getDetailedLineStage(t) === col.id;
            }
            if (groupBy === 'PRIORITY') {
              const project = useProjectStore.getState().projects.find(p => p.id === t.projectId);
              if (!project) return col.id === 'LOW';
              const urgency = getDeliveryUrgencyBucket(project);
              return urgency === col.id;
            }
            if (groupBy === 'ASSIGNEE') return (col.id === 'UNASSIGNED' && !t.assigneeId) || t.assigneeId === col.id;
            return false;
          });
          return (
            <Column 
              key={col.id} 
              id={col.id as string} 
              title={col.title} 
              tasks={colTasks} 
              onTaskClick={setSelectedTask}
            />
          );
        })}
      </div>
      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </DndContext>
  );
};
