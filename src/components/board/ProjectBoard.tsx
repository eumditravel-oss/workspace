import React from 'react';
import { Project, TaskCard } from '@/types/models';
import { ProjectSummaryCard } from './ProjectSummaryCard';
import { GroupByOption } from './Board';
import { getDeliveryUrgencyBucket } from '@/lib/selectors';

interface Props {
  projects: Project[];
  tasks: TaskCard[];
  groupBy: GroupByOption;
  onProjectClick: (projectId: string) => void;
}

export const ProjectBoard: React.FC<Props> = ({ projects, tasks, groupBy, onProjectClick }) => {
  const getColumns = () => {
    if (groupBy === 'PRIORITY') {
      return [
        { id: 'WITHIN_1_WEEK', title: '🔴 납품 1주일 전' },
        { id: 'WITHIN_2_WEEKS', title: '🟠 납품 2주일 전' },
        { id: 'WITHIN_1_MONTH', title: '🔵 납품 1달 전' },
        { id: 'UNSET', title: '⚪ 미정' },
      ];
    }
    // Default to Status groups
    return [
      { id: 'INTAKE', title: '수주/대기' },
      { id: 'IN_PROGRESS', title: '진행 중' },
      { id: 'COMPLETED', title: '완료' },
    ];
  };

  const columns = getColumns();

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6 p-2 custom-scrollbar">
      {columns.map(col => {
        const colProjects = projects.filter(p => {
          if (groupBy === 'PRIORITY') {
            return getDeliveryUrgencyBucket(p) === col.id;
          }
          // Simple status grouping logic
          if (col.id === 'INTAKE') return ['INTAKE_RECEIVED', 'MANAGER_REVIEW', 'PM_ASSIGNED', 'SCHEDULE_DRAFTING', 'SCHEDULE_PENDING_APPROVAL'].includes(p.status);
          if (col.id === 'COMPLETED') return ['COMPLETED', 'ARCHIVED'].includes(p.status);
          return ['IN_PROGRESS', 'SCHEDULE_APPROVED', 'QA_REVIEW'].includes(p.status);
        });

        return (
          <div key={col.id} className="flex-shrink-0 w-80 bg-gray-50/50 rounded-xl flex flex-col max-h-[calc(100vh-200px)] border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100/50 rounded-t-xl">
              <h2 className="font-bold text-gray-700">{col.title}</h2>
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {colProjects.length}
              </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {colProjects.map(project => (
                <ProjectSummaryCard 
                  key={project.id} 
                  project={project} 
                  tasks={tasks}
                  onClick={onProjectClick} 
                />
              ))}
              {colProjects.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
                  프로젝트가 없습니다
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
