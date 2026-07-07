import { PersonnelCard, Project, TaskCard, PersonalSchedule, ApprovalRequest } from '@/types/models';

export const canViewProject = (user: PersonnelCard, project: Project): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'DEPARTMENT_MANAGER') return user.departmentId === project.departmentId;
  if (user.role === 'PM') return project.pmId === user.id || project.departmentId === user.departmentId;
  return project.departmentId === user.departmentId;
};

export const canEditProject = (user: PersonnelCard, project: Project): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'DEPARTMENT_MANAGER') return user.departmentId === project.departmentId;
  if (user.role === 'PM') return project.pmId === user.id;
  return false;
};

export const canViewTask = (user: PersonnelCard, task: TaskCard): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'DEPARTMENT_MANAGER') return user.departmentId === task.departmentId;
  if (user.role === 'PM') return task.pmId === user.id || task.departmentId === user.departmentId;
  return task.assigneeId === user.id;
};

export const canEditTask = (user: PersonnelCard, task: TaskCard): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'DEPARTMENT_MANAGER') return user.departmentId === task.departmentId;
  if (user.role === 'PM') return task.pmId === user.id;
  return task.assigneeId === user.id;
};

export const canMoveTask = (user: PersonnelCard, task: TaskCard, targetStatus: string): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'DEPARTMENT_MANAGER') return user.departmentId === task.departmentId;
  if (user.role === 'PM') return task.pmId === user.id;
  return task.assigneeId === user.id;
};

export const canApproveRequest = (user: PersonnelCard, request: ApprovalRequest): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.role === 'DEPARTMENT_MANAGER') return request.managerId === user.id;
  if (user.role === 'PM') return request.pmId === user.id;
  return false;
};

export const canViewSchedule = (user: PersonnelCard, schedule: PersonalSchedule): boolean => {
  if (user.role === 'SUPER_ADMIN') return true;
  if (user.id === schedule.userId) return true;
  if (user.role === 'DEPARTMENT_MANAGER') return user.departmentId === schedule.departmentId;
  if (user.role === 'PM') return user.departmentId === schedule.departmentId;
  return false;
};

export const getVisibleProjects = (user: PersonnelCard, projects: Project[]): Project[] => {
  return projects.filter(p => canViewProject(user, p));
};

export const getVisibleTasks = (user: PersonnelCard, tasks: TaskCard[]): TaskCard[] => {
  return tasks.filter(t => canViewTask(user, t));
};

export const getVisibleScheduleItems = (user: PersonnelCard, items: PersonalSchedule[]): PersonalSchedule[] => {
  return items.filter(s => canViewSchedule(user, s));
};
