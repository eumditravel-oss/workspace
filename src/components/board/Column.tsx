import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from '@/types/models';
import { TaskCardItem } from './TaskCardItem';
import { TaskStatus } from '@/types/models';
import { getColumnSummary } from '@/lib/selectors';

interface ColumnProps {
  id: string;
  title: string;
  tasks: TaskCard[];
  onTaskClick?: (task: TaskCard) => void;
}

export const Column: React.FC<ColumnProps> = ({ id, title, tasks, onTaskClick }) => {
  const { setNodeRef } = useDroppable({ id });
  
  const { avgProgress, delayedCount, urgentCount, pendingCount } = getColumnSummary(tasks);

  return (
    <div className="bg-gray-50/50 p-4 rounded-xl min-w-[300px] w-[300px] flex flex-col max-h-[85vh] border border-gray-200/60 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-gray-800 flex justify-between items-center mb-2">
          {title}
          <span className="bg-white text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-sm border border-gray-100">
            {tasks.length}
          </span>
        </h3>
        
        {tasks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 text-[10px] text-gray-500 font-medium bg-white/60 p-2 rounded-lg border border-gray-100">
            <span>평균 <span className="text-gray-700">{avgProgress}%</span></span>
            {delayedCount > 0 && <span>· <span className="text-red-500">지연 {delayedCount}</span></span>}
            {urgentCount > 0 && <span>· <span className="text-orange-500">긴급 {urgentCount}</span></span>}
            {pendingCount > 0 && <span>· <span className="text-purple-500">대기 {pendingCount}</span></span>}
          </div>
        )}
      </div>
      
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-3 min-h-[100px] pr-1 pb-4 custom-scrollbar">
        {tasks.map(task => (
          <TaskCardItem key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
        ))}
      </div>
    </div>
  );
};
