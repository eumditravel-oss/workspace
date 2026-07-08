import React from 'react';
import { Project, TaskCard } from '@/types/models';
import { getProjectOverallProgress, getProjectDeliveryLifecycle, getProjectDeliveryBadge } from '@/lib/selectors';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';

interface Props {
  project: Project;
  tasks: TaskCard[];
  onClick: (projectId: string) => void;
}

export const ProjectSummaryCard: React.FC<Props> = ({ project, tasks, onClick }) => {
  const progress = getProjectOverallProgress(project, tasks);
  const lifecycle = getProjectDeliveryLifecycle(project);
  const badgeText = getProjectDeliveryBadge(project);
  
  const { postDeliveryWorkRequests } = useProjectStore();
  
  const pendingTasks = tasks.filter(t => t.projectId === project.id && t.status !== 'DONE').length;
  const pendingRequestsCount = postDeliveryWorkRequests.filter(r => r.projectId === project.id && (r.status === 'PENDING_PM' || r.status === 'PENDING_MANAGER' || r.status === 'PENDING_SUPER_ADMIN')).length;
  
  const getBadgeStyle = () => {
    switch (lifecycle) {
      case 'OVERDUE': return 'text-red-700 bg-red-100 border-red-300';
      case 'DUE_TODAY': return 'text-red-600 bg-red-50 border-red-200';
      case 'DUE_WITHIN_1_WEEK': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'DUE_WITHIN_2_WEEKS': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'DUE_WITHIN_1_MONTH': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'POST_DELIVERY_WORK_REQUESTED': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'POST_DELIVERY_WORK_IN_PROGRESS': return 'text-purple-700 bg-purple-100 border-purple-300';
      case 'REOPENED': return 'text-teal-600 bg-teal-50 border-teal-200';
      case 'DELIVERY_CLOSED_AUTO':
      case 'DELIVERY_CLOSED_MANUAL': return 'text-gray-600 bg-gray-100 border-gray-300';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

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
          <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getBadgeStyle()}`}>{badgeText}</span>
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
      {pendingRequestsCount > 0 && (
        <div className="mt-2 text-xs font-semibold text-orange-600 flex items-center gap-1 bg-orange-50 p-1.5 rounded border border-orange-200">
          <AlertCircle className="w-3 h-3" />
          미결 추가업무 요청 {pendingRequestsCount}건
        </div>
      )}
    </div>
  );
};
