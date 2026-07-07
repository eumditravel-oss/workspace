import { TaskCard, Project, PersonnelCard, TaskBlocker, ProgressUpdate } from '@/types/models';

export const calculateTaskProgress = (task: TaskCard): number => {
  if (task.status === 'DONE' || task.completionStatus === 'COMPLETED') return 100;
  if (task.progress !== undefined) return task.progress;
  
  switch (task.status) {
    case 'TODO': return 0;
    case 'READY': return 10;
    case 'IN_PROGRESS': return 50;
    case 'REVIEW': return 90;
    case 'HOLD': return 0;
    case 'REJECTED': return 0;
    default: return 0;
  }
};

export const calculateScheduleProgress = (task: TaskCard): number => {
  if (!task.startDate || !task.dueDate) return 0;
  
  const start = new Date(task.startDate).getTime();
  const end = new Date(task.dueDate).getTime();
  const now = new Date().getTime();

  if (now < start) return 0;
  if (now >= end) return 100;

  const total = end - start;
  const elapsed = now - start;
  
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

export const calculateTaskHealthScore = (task: TaskCard, blockers: TaskBlocker[], updates: ProgressUpdate[]): number => {
  if (task.status === 'DONE' || task.completionStatus === 'COMPLETED') return 100;
  
  let score = 100;

  // 1. Unresolved blockers penalty
  const openBlockers = blockers.filter(b => b.taskId === task.id && b.status === 'OPEN');
  if (openBlockers.length > 0) {
    score -= 20;
  }

  // 2. Overdue penalty
  if (task.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      score -= (diffDays * 10);
    }
  }

  // 3. Stale update penalty (if in progress and no updates for 3 days)
  if (task.status === 'IN_PROGRESS' || task.status === 'REVIEW') {
    const taskUpdates = updates.filter(u => u.taskId === task.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const lastUpdateDate = taskUpdates.length > 0 ? new Date(taskUpdates[0].createdAt) : (task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt || Date.now()));
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastUpdateDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 3) {
      score -= 15;
    }
  }

  return Math.max(0, Math.min(100, score));
};

export const calculateProjectProgress = (tasks: TaskCard[]): number => {
  if (!tasks.length) return 0;
  const totalProgress = tasks.reduce((sum, task) => sum + calculateTaskProgress(task), 0);
  return Math.round(totalProgress / tasks.length);
};

export const getColumnSummary = (tasks: TaskCard[]) => {
  const avgProgress = tasks.length > 0 
    ? Math.round(tasks.reduce((sum, t) => sum + calculateTaskProgress(t), 0) / tasks.length)
    : 0;

  const delayedCount = tasks.filter(t => {
    if (!t.dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.dueDate < today && t.status !== 'DONE';
  }).length;

  const urgentCount = tasks.filter(t => t.priority === 'URGENT').length;
  const pendingCount = tasks.filter(t => t.approvalStatus === 'PENDING').length;

  return { avgProgress, delayedCount, urgentCount, pendingCount };
};

export const normalizeProjectName = (rawName: string): string => {
  if (!rawName) return '';
  return rawName.replace(/[\n\r]+/g, ' ').trim();
};

export const normalizeScopeName = (rawName: string): string => {
  if (!rawName) return '';
  return rawName.replace(/[\n\r]+/g, ' ').trim();
};

export const getDeliveryUrgencyBucket = (project: Project, today: Date = new Date()): 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW' => {
  if (!project.deliveryDate) return 'LOW';
  
  const delivery = new Date(project.deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  const current = new Date(today);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = delivery.getTime() - current.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 3) return 'URGENT';
  if (diffDays <= 7) return 'HIGH';
  if (diffDays <= 14) return 'NORMAL';
  return 'LOW';
};

export const getProjectOverallProgress = (project: Project, tasks: TaskCard[]): number => {
  if (project.progress !== undefined && project.progress !== null) return project.progress;
  const projectTasks = tasks.filter(t => t.projectId === project.id && !t.isDeleted);
  if (projectTasks.length === 0) return 0;
  const total = projectTasks.reduce((sum, t) => sum + calculateTaskProgress(t), 0);
  return Math.round(total / projectTasks.length);
};
