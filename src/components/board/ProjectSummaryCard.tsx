import React from 'react';
import { Project, TaskCard } from '@/types/models';
import { getProjectOverallProgress, getDeliveryUrgencyBucket } from '@/lib/selectors';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface Props {
  project: Project;
  tasks: TaskCard[];
  onClick: (projectId: string) => void;
}

export const ProjectSummaryCard: React.FC<Props> = ({ project, tasks, onClick }) => {
  const progress = getProjectOverallProgress(project, tasks);
  const urgency = getDeliveryUrgencyBucket(project);
  
  const urgencyColors = {
    URGENT: 'bg-red-100 text-red-800 border-red-200',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-200',
    NORMAL: 'bg-blue-100 text-blue-800 border-blue-200',
    LOW: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const urgencyLabels = {
    URGENT: '긴급',
    HIGH: '높음',
    NORMAL: '보통',
    LOW: '낮음',
  };

  const pendingTasks = tasks.filter(t => t.projectId === project.id && t.status !== 'DONE').length;

  return (
    <div 
      onClick={() => onClick(project.id)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer space-y-3"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-800 line-clamp-2">{project.title}</h3>
        <span className={`px-2 py-1 rounded text-xs font-bold border ${urgencyColors[urgency]}`}>
          {urgencyLabels[urgency]}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600 font-medium">
          <span>전체 공정률</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2 text-xs text-gray-500 mt-2">
        <div className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          <span>남은 업무 {pendingTasks}건</span>
        </div>
        {project.deliveryDate && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{project.deliveryDate} 납품</span>
          </div>
        )}
      </div>
    </div>
  );
};
