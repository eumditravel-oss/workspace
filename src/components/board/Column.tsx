import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskCard } from '@/types/models';
import { TaskCardItem } from './TaskCardItem';
import { TaskStatus } from '@/types/models';

interface ColumnProps {
  id: TaskStatus;
  title: string;
  tasks: TaskCard[];
}

export const Column: React.FC<ColumnProps> = ({ id, title, tasks }) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="bg-gray-100 p-4 rounded-xl min-w-[280px] w-72 flex flex-col max-h-[80vh]">
      <h3 className="font-bold text-gray-700 mb-4 flex justify-between">
        {title}
        <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">{tasks.length}</span>
      </h3>
      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-3 min-h-[100px]">
        {tasks.map(task => (
          <TaskCardItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
};
