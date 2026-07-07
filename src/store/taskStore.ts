import { create } from 'zustand';
import { TaskCard, TaskStatus, CompletionStatus, ProgressUpdate, TaskChecklistItem, TaskArtifact, TaskBlocker, UserId, TaskWorkSegment } from '@/types/models';
import { DetailedLineStage } from '@/lib/selectors';
import { fullTasks } from '@/data/fullScheduleSeed';

interface TaskState {
  tasks: TaskCard[];
  progressUpdates: ProgressUpdate[];
  checklists: TaskChecklistItem[];
  artifacts: TaskArtifact[];
  blockers: TaskBlocker[];
  workSegments: TaskWorkSegment[];
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => void;
  updateDetailedLineStage: (taskId: string, stage: DetailedLineStage) => void;
  updateTaskAssignee: (taskId: string, newAssigneeId: UserId | undefined) => void;
  updateTaskPriority: (taskId: string, newPriority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW') => void;
  updateTaskProgress: (taskId: string, newProgress: number, authorId: UserId, memo: string, blocker?: string) => void;
  requestTaskCompletion: (taskId: string, memo: string) => void;
  reviewTaskCompletion: (taskId: string, isApproved: boolean) => void;
  addChecklistItem: (item: Omit<TaskChecklistItem, 'id'>) => void;
  toggleChecklistItem: (itemId: string, completedBy: UserId) => void;
  addArtifact: (artifact: Omit<TaskArtifact, 'id' | 'createdAt'>) => void;
  addBlocker: (blocker: Omit<TaskBlocker, 'id' | 'status' | 'createdAt'>) => void;
  resolveBlocker: (blockerId: string, resolvedBy: UserId) => void;
  addWorkSegment: (segment: Omit<TaskWorkSegment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateWorkSegment: (id: string, updates: Partial<TaskWorkSegment>) => void;
  deleteWorkSegment: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: fullTasks,
  progressUpdates: [],
  checklists: [
    { id: 'chk1', taskId: '1', content: 'UI 디자인 시안 확인', isCompleted: true, completedAt: new Date().toISOString() },
    { id: 'chk2', taskId: '1', content: '퍼블리싱 적용', isCompleted: false },
  ],
  artifacts: [],
  blockers: [],
  workSegments: [],
  updateTaskStatus: (taskId, newStatus) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === taskId 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } 
        : t
    )
  })),
  updateDetailedLineStage: (taskId, stage) => set((state) => {
    return {
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        let newStatus: TaskStatus = t.status;
        let newCompletion: CompletionStatus | undefined = t.completionStatus;
        
        switch (stage) {
          case 'WAITING':
            newStatus = 'TODO';
            newCompletion = 'NOT_STARTED';
            break;
          case 'QC_PM_START':
            newStatus = 'READY';
            newCompletion = 'NOT_STARTED';
            break;
          case 'IN_PROGRESS':
            newStatus = 'IN_PROGRESS';
            newCompletion = 'IN_PROGRESS';
            break;
          case 'PM_REVIEW':
            newStatus = 'REVIEW';
            newCompletion = 'PM_REVIEWING';
            break;
          case 'QC_REVIEW':
            newStatus = 'REVIEW';
            newCompletion = 'MANAGER_REVIEWING';
            break;
          case 'DONE':
            newStatus = 'DONE';
            newCompletion = 'COMPLETED';
            break;
        }
        
        return { 
          ...t, 
          status: newStatus, 
          completionStatus: newCompletion, 
          updatedAt: new Date().toISOString() 
        };
      })
    };
  }),
  updateTaskAssignee: (taskId, newAssigneeId) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === taskId 
        ? { ...t, assigneeId: newAssigneeId, updatedAt: new Date().toISOString() } 
        : t
    )
  })),
  updateTaskPriority: (taskId, newPriority) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === taskId 
        ? { ...t, priority: newPriority, updatedAt: new Date().toISOString() } 
        : t
    )
  })),
  requestTaskCompletion: (taskId, memo) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === taskId
        ? { 
            ...t, 
            status: 'REVIEW', 
            completionStatus: 'PM_REVIEWING', 
            description: t.description + `\n\n[완료 메모]\n${memo}`,
            updatedAt: new Date().toISOString() 
          }
        : t
    )
  })),
  reviewTaskCompletion: (taskId, isApproved) => set((state) => ({
    tasks: state.tasks.map(t =>
      t.id === taskId
        ? {
            ...t,
            status: isApproved ? 'DONE' : 'IN_PROGRESS',
            completionStatus: isApproved ? 'COMPLETED' : 'REJECTED',
            updatedAt: new Date().toISOString()
          }
        : t
    )
  })),
  updateTaskProgress: (taskId, newProgress, authorId, memo, blocker) => set((state) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return state;

    const progressBefore = task.progress || 0;
    
    // Add ProgressUpdate record
    const newUpdate: ProgressUpdate = {
      id: `pu_${Date.now()}`,
      taskId,
      authorId,
      progressBefore,
      progressAfter: newProgress,
      workSummary: memo,
      blocker,
      createdAt: new Date().toISOString()
    };

    return {
      progressUpdates: [newUpdate, ...state.progressUpdates],
      tasks: state.tasks.map(t =>
        t.id === taskId
          ? { ...t, progress: newProgress, updatedAt: new Date().toISOString() }
          : t
      )
    };
  }),
  addChecklistItem: (item) => set((state) => ({
    checklists: [...state.checklists, { ...item, id: `chk_${Date.now()}` }]
  })),
  toggleChecklistItem: (itemId, completedBy) => set((state) => ({
    checklists: state.checklists.map(c => 
      c.id === itemId 
        ? { ...c, isCompleted: !c.isCompleted, completedBy: !c.isCompleted ? completedBy : undefined, completedAt: !c.isCompleted ? new Date().toISOString() : undefined }
        : c
    )
  })),
  addArtifact: (artifact) => set((state) => ({
    artifacts: [...state.artifacts, { ...artifact, id: `art_${Date.now()}`, createdAt: new Date().toISOString() }]
  })),
  addBlocker: (blocker) => set((state) => ({
    blockers: [...state.blockers, { ...blocker, id: `blk_${Date.now()}`, status: 'OPEN', createdAt: new Date().toISOString() }]
  })),
  resolveBlocker: (blockerId, resolvedBy) => set((state) => ({
    blockers: state.blockers.map(b => 
      b.id === blockerId 
        ? { ...b, status: 'RESOLVED', resolvedAt: new Date().toISOString(), resolvedBy } 
        : b
    )
  })),
  addWorkSegment: (segment) => set((state) => ({
    workSegments: [...state.workSegments, {
      ...segment,
      id: `ws_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }]
  })),
  updateWorkSegment: (id, updates) => set((state) => ({
    workSegments: state.workSegments.map(ws => 
      ws.id === id ? { ...ws, ...updates, updatedAt: new Date().toISOString() } : ws
    )
  })),
  deleteWorkSegment: (id) => set((state) => ({
    workSegments: state.workSegments.filter(ws => ws.id !== id)
  }))
}));
