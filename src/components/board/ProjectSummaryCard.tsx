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
  


  const pendingTasks = tasks.filter(t => t.projectId === project.id && t.status !== 'DONE').length;

  return (
    <div 
      onClick={() => onClick(project.id)}
      className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer space-y-3"
    >
      <div className="flex justify-between items-start">
        <h3 className="font-bold text-gray-800 line-clamp-2">{project.title}</h3>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600 font-medium">
          {urgency === 'WITHIN_1_WEEK' && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">납품 1주일 전</span>}
          {urgency === 'WITHIN_2_WEEKS' && <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">납품 2주일 전</span>}
          {urgency === 'WITHIN_1_MONTH' && <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">납품 1달 전</span>}
          {urgency === 'UNSET' && <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">미정</span>}
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
