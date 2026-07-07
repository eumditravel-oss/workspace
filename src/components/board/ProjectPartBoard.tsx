import React from 'react';
import { TaskCard, PersonnelCard, ProjectWorkPart } from '@/types/models';
import { getProjectWorkParts, getPartTaskCards, getPartProgress, getPartEmployees, calculateTaskProgress } from '@/lib/selectors';
import { TaskDetailModal } from './TaskDetailModal';

interface ProjectPartBoardProps {
  projectId: string;
  tasks: TaskCard[];
  users: PersonnelCard[];
  onTaskClick?: (taskId: string) => void;
}

export const ProjectPartBoard: React.FC<ProjectPartBoardProps> = ({ projectId, tasks, users }) => {
  const [selectedTask, setSelectedTask] = React.useState<TaskCard | null>(null);
  
  const parts = getProjectWorkParts(projectId, tasks, users);
  
  if (parts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 bg-white rounded-lg border border-dashed">
        <p>배정된 업무 파트가 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-6 overflow-x-auto pb-6 p-2 custom-scrollbar">
        {parts.map(part => {
          const partTasks = getPartTaskCards(part.id, parts, tasks);
          const partEmployees = getPartEmployees(part.id, parts, tasks, users);
          const avgProgress = getPartProgress(part.id, parts, tasks);
          
          return (
            <div key={part.id} className="flex-shrink-0 w-80 bg-gray-50 rounded-xl flex flex-col max-h-[calc(100vh-200px)]">
              {/* Column Header */}
              <div className="p-3 bg-gray-100 rounded-t-xl border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-gray-800 text-sm truncate" title={part.partName}>{part.partName}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-full border">
                    {partTasks.length}건
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                  <span className="font-medium">참여 {partEmployees.length}명</span>
                  <span className="text-gray-300">|</span>
                  <span className="font-medium text-blue-600">진행률 {avgProgress}%</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(0, Math.min(100, avgProgress))}%` }}
                  />
                </div>
              </div>

              {/* Cards List */}
              <div className="flex-1 p-2 space-y-3 overflow-y-auto custom-scrollbar min-h-[100px]">
                {partTasks.map(task => {
                  const assignee = users.find(u => u.id === task.assigneeId);
                  const progress = calculateTaskProgress(task);
                  
                  return (
                    <div 
                      key={task.id} 
                      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {task.scopeName || 'General'}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'DONE' ? 'bg-green-100 text-green-700' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          task.status === 'REVIEW' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-sm text-gray-800 mb-2 line-clamp-2">{task.title}</h4>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {assignee ? (assignee.displayName?.[0] || assignee.name[0]) : '?'}
                          </div>
                          <span className="truncate max-w-[80px]">{assignee ? (assignee.displayName || assignee.name) : '미배정'}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 font-medium">
                          <span>{progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {partTasks.length === 0 && (
                  <div className="text-center py-4 text-xs text-gray-400">
                    카드가 없습니다.
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
