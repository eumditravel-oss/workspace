import { TaskCard, Project, PersonnelCard } from '@/types/models';

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
