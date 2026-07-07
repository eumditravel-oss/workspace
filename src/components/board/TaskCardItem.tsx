import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TaskCard } from '@/types/models';
import { Clock, User } from 'lucide-react';

interface TaskCardItemProps {
  task: TaskCard;
}

export const TaskCardItem: React.FC<TaskCardItemProps> = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const priorityColors = {
    URGENT: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    NORMAL: 'bg-blue-100 text-blue-700 border-blue-200',
    LOW: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      <h4 className="font-semibold text-gray-800 text-sm mb-1">{task.title}</h4>
      <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
        <div className="flex items-center">
          <User className="w-3 h-3 mr-1" />
          {task.assigneeId || '미배정'}
        </div>
        <div className="flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {task.dueDate ? task.dueDate.substring(5) : '-'}
        </div>
      </div>
    </div>
  );
};
