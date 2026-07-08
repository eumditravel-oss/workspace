import React from 'react';
import { Project, TaskCard, RevisionRequest } from '@/types/models';
import { ProjectSummaryCard } from './ProjectSummaryCard';
import { GroupByOption } from './Board';
import { getDeliveryUrgencyBucket, getProjectBoardColumn } from '@/lib/selectors';

interface Props {
  projects: Project[];
  tasks: TaskCard[];
  revisionRequests: RevisionRequest[];
  groupBy: GroupByOption;
  onProjectClick: (projectId: string) => void;
}

export const ProjectBoard: React.FC<Props> = ({ projects, tasks, revisionRequests, groupBy, onProjectClick }) => {
  const getColumns = () => {
    if (groupBy === 'PRIORITY') {
      const isInternal = projects.length > 0 && projects[0].projectSourceType === 'INTERNAL_DEVELOPMENT';
      const label = isInternal ? '목표' : '납품';
      return [
        { id: 'OVERDUE', title: `🚨 ${label}일 경과` },
        { id: 'WITHIN_1_WEEK', title: `🔴 ${label} 1주일 전` },
        { id: 'WITHIN_2_WEEKS', title: `🟠 ${label} 2주일 전` },
        { id: 'WITHIN_1_MONTH', title: `🔵 ${label} 1달 전` },
        { id: 'UNSET', title: '⚪ 미정' },
      ];
    }
    // Default to Status groups
    return [
      { id: 'PRE_WORK', title: '작수 전' },
      { id: 'IN_PROGRESS', title: '진행 중' },
      { id: 'REVISION', title: '수정(Revision)' },
      { id: 'COMPLETED', title: '완료' },
    ];
  };

  const columns = getColumns();

  return (
    <div 
      className={`grid gap-6 pb-6 p-2 grid-cols-1 md:grid-cols-2 ${columns.length === 5 ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-4'}`}
    >
      {columns.map(col => {
        const colProjects = projects.filter(p => {
          if (groupBy === 'PRIORITY') {
            return getDeliveryUrgencyBucket(p) === col.id;
          }
          
          const hasActiveRevision = revisionRequests.some(r => r.projectId === p.id && (r.status === 'PENDING' || r.status === 'ACCEPTED'));
          const columnId = getProjectBoardColumn(p, new Date(), hasActiveRevision);
          if (col.id === 'PRE_WORK') return columnId === 'PRE_WORK';
          if (col.id === 'REVISION') return columnId === 'REVISION';
          if (col.id === 'COMPLETED') return columnId === 'COMPLETED';
          return columnId === 'IN_PROGRESS';
        });

        return (
          <div key={col.id} className="bg-gray-50/50 rounded-xl flex flex-col max-h-[calc(100vh-200px)] border border-gray-200">
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
