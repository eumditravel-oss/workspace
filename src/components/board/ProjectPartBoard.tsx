import React from 'react';
import { TaskCard, PersonnelCard, ProjectWorkPart } from '@/types/models';
import { getProjectWorkParts, getPartTaskCards, getPartProgress, getPartEmployees, calculateTaskProgress } from '@/lib/selectors';
import { TaskDetailModal } from './TaskDetailModal';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { CheckCircle } from 'lucide-react';

interface ProjectPartBoardProps {
  projectId: string;
  tasks: TaskCard[];
  users: PersonnelCard[];
  onTaskClick?: (taskId: string) => void;
  onDispatchClick?: () => void;
}

export const ProjectPartBoard: React.FC<ProjectPartBoardProps> = ({ projectId, tasks, users, onDispatchClick }) => {
  const [selectedTask, setSelectedTask] = React.useState<TaskCard | null>(null);
  const { currentUser } = useAuthStore();
  const project = useProjectStore(state => state.projects.find(p => p.id === projectId));
  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);
  const updateProjectStatus = useProjectStore(state => state.updateProjectStatus);
  
  const parts = getProjectWorkParts(projectId, tasks, users);
  
  if (parts.length === 0) {
    const isAuthorized = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'DEPARTMENT_MANAGER' || (currentUser?.role === 'PM' && project?.pmId === currentUser?.id);

    return (
      <div className="flex flex-col items-center justify-center h-64 text-[var(--color-text-sub)] bg-[var(--color-surface)] rounded-lg border border-dashed gap-4">
        <p>배정된 업무 파트가 없습니다.</p>
        {isAuthorized && onDispatchClick && (
          <button 
            onClick={onDispatchClick}
            className="px-4 py-2 bg-[var(--color-primary)] text-white font-bold rounded-md hover:bg-opacity-90 transition-colors shadow-sm"
          >
            세부 업무 및 파트 배정하기
          </button>
        )}
      </div>
    );
  }

  const allTasksDone = tasks.length > 0 && tasks.every(t => t.status === 'DONE');
  const isPM = currentUser?.role === 'PM' && project?.pmId === currentUser?.id;

  return (
    <>
      {allTasksDone && isPM && project?.status !== 'MANAGER_REVIEW' && project?.status !== 'COMPLETED' && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => updateProjectStatus(projectId, 'MANAGER_REVIEW')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors shadow-sm animate-pulse"
          >
            <CheckCircle className="w-4 h-4" />
            부서장(MANAGER) 검수 요청
          </button>
        </div>
      )}
      <div className="flex flex-col space-y-6 overflow-y-auto pb-6 p-2 custom-scrollbar max-h-[calc(100vh-150px)]">
        {parts.map(part => {
          const partTasks = getPartTaskCards(part.id, parts, tasks);
          const partEmployees = getPartEmployees(part.id, parts, tasks, users);
          const avgProgress = getPartProgress(part.id, parts, tasks);
          
          return (
            <div key={part.id} className="w-full bg-[var(--color-bg)] rounded-xl flex flex-col border border-[var(--color-border)] shadow-sm">
              {/* Row Header */}
              <div className="p-4 bg-[var(--color-surface)] rounded-t-xl border-b border-[var(--color-border)] flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-[var(--color-text-main)] text-base">{part.partName}</h3>
                  <span className="text-xs font-semibold text-[var(--color-text-sub)] bg-gray-100 px-2 py-0.5 rounded-full border">
                    {partTasks.length}건
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-sub)]">
                    <span className="font-medium">참여 {partEmployees.length}명</span>
                    <span className="text-gray-300">|</span>
                    <span className="font-medium text-blue-600">진행률 {avgProgress}%</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.max(0, Math.min(100, avgProgress))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Cards List (Horizontal) */}
              <div className="flex space-x-4 p-4 overflow-x-auto custom-scrollbar min-h-[160px]">
                {partTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const progress = calculateTaskProgress(task);
                  const isMyTask = currentUser?.id === task.assigneeId;
                  
                  return (
                    <div 
                      key={task.id} 
                      className="flex-shrink-0 w-[280px] bg-[var(--color-surface)] p-3 rounded-lg shadow-sm border border-[var(--color-border)] hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {task.scopeName || 'General'}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                            task.status === 'REVIEW' ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-[var(--color-text-sub)]'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        
                        <h4 className="font-medium text-sm text-[var(--color-text-main)] mb-4 line-clamp-2">{task.title}</h4>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-[var(--color-text-sub)] mt-auto">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-[var(--color-text-sub)]">
                            {assignee ? (assignee.displayName?.[0] || assignee.name[0]) : '?'}
                          </div>
                          <span className="truncate max-w-[120px]">{assignee ? (assignee.displayName || assignee.name) : '미배정'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 font-medium">
                          {isMyTask && task.status !== 'DONE' ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateTaskStatus(task.id, 'DONE'); }}
                              className="text-[10px] px-2 py-1 bg-green-100 text-green-700 border border-green-200 rounded hover:bg-green-200 transition-colors font-bold shadow-sm"
                            >
                              작업 완료
                            </button>
                          ) : (
                            <span>{progress}%</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {partTasks.length === 0 && (
                  <div className="flex items-center justify-center w-full py-8 text-sm text-[var(--color-text-sub)]">
                    등록된 업무 카드가 없습니다.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
};
