import React, { useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TaskCard } from '@/types/models';
import { Clock, User, AlertCircle, FileText, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { calculateTaskProgress } from '@/lib/selectors';

interface TaskCardItemProps {
  task: TaskCard;
  onClick?: () => void;
}

export const TaskCardItem: React.FC<TaskCardItemProps> = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const users = useAuthStore(state => state.users);
  const projects = useProjectStore(state => state.projects);

  const assignee = users.find(u => u.id === task.assigneeId);
  const pm = users.find(u => u.id === task.pmId);
  const project = projects.find(p => p.id === task.projectId);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : undefined,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  const priorityColors = {
    URGENT: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    NORMAL: 'bg-blue-100 text-blue-700 border-blue-200',
    LOW: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const isDelayed = useMemo(() => {
    if (!task.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today && task.status !== 'DONE';
  }, [task.dueDate, task.status]);

  const isPendingApproval = task.approvalStatus === 'PENDING';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onClick?.()}
      className={`bg-white p-3 rounded-lg shadow-sm border ${isDragging ? 'border-blue-400 shadow-md ring-2 ring-blue-100' : 'border-gray-200'} cursor-grab active:cursor-grabbing hover:shadow-md hover:border-gray-300 transition-all group`}
    >
      <div className="flex justify-between items-start mb-2 gap-1 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {task.priority === 'URGENT' && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${priorityColors[task.priority]}`}>
              긴급
            </span>
          )}
          {isDelayed && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold bg-red-50 text-red-600 border-red-200 flex items-center">
              <AlertCircle className="w-3 h-3 mr-0.5" /> 지연
            </span>
          )}
          {isPendingApproval && (
            <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold bg-purple-50 text-purple-600 border-purple-200">
              승인 대기
            </span>
          )}
        </div>
        {task.sourceSheet && (
          <span className="text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 flex items-center whitespace-nowrap">
            <FileText className="w-2.5 h-2.5 mr-0.5" />
            {task.sourceSheet}
          </span>
        )}
      </div>

      <div className="mb-2">
        <span className="text-[10px] font-medium text-gray-500 mb-0.5 block truncate">
          {project?.title || 'Unknown Project'}
        </span>
        <h4 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
          {task.title}
        </h4>
      </div>

      <div className="my-3">
        <ProgressBar 
          progress={calculateTaskProgress(task)} 
          showLabel={true} 
          colorClass={calculateTaskProgress(task) === 100 ? 'bg-green-500' : isDelayed ? 'bg-red-500' : 'bg-blue-500'} 
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2 border-t pt-2 border-gray-50">
        <div className="flex items-center gap-2">
          <div className="flex items-center" title="담당자">
            <User className="w-3 h-3 mr-1" />
            <span className="truncate max-w-[65px]">{assignee?.displayName || '미배정'}</span>
          </div>
          {pm && (
            <div className="flex items-center text-gray-400" title="PM">
              <span className="truncate max-w-[45px]">({pm.displayName})</span>
            </div>
          )}
        </div>
        <div className="flex items-center bg-gray-50 px-1.5 py-0.5 rounded" title="마감일">
          <Clock className={`w-3 h-3 mr-1 ${isDelayed ? 'text-red-500' : ''}`} />
          <span className={isDelayed ? 'text-red-600 font-medium' : ''}>
            {task.dueDate ? task.dueDate.substring(5) : '-'}
          </span>
        </div>
      </div>
    </div>
  );
};
