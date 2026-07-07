export type Role = 'SUPER_ADMIN' | 'DEPARTMENT_MANAGER' | 'PM' | 'WORKER';
export type DepartmentId = string;
export type UserId = string;

export interface PersonnelCard {
  id: UserId;
  employeeNumber: string;
  name: string;
  displayName?: string;
  koreanAlias?: string;
  email?: string;
  phone?: string;
  departmentId: DepartmentId;
  departmentName?: string;
  teamName?: string;
  groupName?: string;
  position: string;
  jobTitle: string;
  role: Role;
  permissionLevel?: number;
  managerId?: UserId;
  pmId?: UserId;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'LEAVE';
  joinedAt?: string;
  profileImageUrl?: string;
  availableWorkHoursPerDay: number;
  defaultWorkStartTime?: string;
  defaultWorkEndTime?: string;
  canManageDepartments?: boolean;
  canManageProjects?: boolean;
  canApproveSchedules?: boolean;
  canViewAllDepartments?: boolean;
  canViewDepartmentOnly?: boolean;
  canViewAssignedProjectsOnly?: boolean;
  canViewOwnTasksOnly?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type ProjectStatus = 'INTAKE_RECEIVED' | 'MANAGER_REVIEW' | 'PM_ASSIGNED' | 'SCHEDULE_DRAFTING' | 'SCHEDULE_PENDING_APPROVAL' | 'SCHEDULE_REJECTED' | 'SCHEDULE_APPROVED' | 'IN_PROGRESS' | 'QA_REVIEW' | 'COMPLETED' | 'ON_HOLD' | 'ARCHIVED';

export interface Project {
  id: string;
  clientId?: string;
  clientName?: string;
  title: string;
  description?: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  status: ProjectStatus;
  departmentId: DepartmentId;
  managerId?: UserId;
  pmId?: UserId;
  startDate?: string;
  dueDate?: string;
  approvedStartDate?: string;
  approvedDueDate?: string;
  progress?: number;
  archiveStatus?: 'ACTIVE' | 'ARCHIVED' | 'RESTORED';
  isDeleted?: boolean;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type TaskStatus = 'TODO' | 'READY' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'HOLD' | 'REJECTED';
export type CompletionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'WORKER_DONE' | 'PM_REVIEWING' | 'PM_APPROVED' | 'MANAGER_REVIEWING' | 'MANAGER_APPROVED' | 'COMPLETED' | 'REOPENED' | 'REJECTED';

export interface TaskCard {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  assigneeId?: UserId;
  pmId?: UserId;
  managerId?: UserId;
  departmentId: DepartmentId;
  startDate?: string;
  dueDate?: string;
  progress?: number;
  orderIndex: number;
  parentTaskId?: string;
  isAdditionalTask?: boolean;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  completionStatus?: CompletionStatus;
  isDeleted?: boolean;
  sourceType?: string;
  sourceSheet?: string;
  sourceMonth?: number;
  sourceAssignmentIds?: string[];
  createdBy?: UserId;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

export interface ProgressUpdate {
  id: string;
  taskId: string;
  authorId: UserId;
  progressBefore: number;
  progressAfter: number;
  workSummary: string;
  blocker?: string;
  createdAt: string;
}

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  content: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: UserId;
}

export interface TaskArtifact {
  id: string;
  taskId: string;
  title: string;
  url: string;
  type: 'LINK' | 'FILE' | 'GITHUB' | 'FIGMA' | 'DOCUMENT';
  addedBy: UserId;
  createdAt: string;
}

export type ApprovalRequestType = 'SCHEDULE_APPROVAL' | 'SCHEDULE_REJECTION' | 'ADDITIONAL_TASK' | 'OVERTIME_REQUEST' | 'DEADLINE_EXTENSION' | 'TASK_REORDER' | 'PM_ASSIGNMENT' | 'MANPOWER_SUPPORT' | 'PRIORITY_CHANGE' | 'SCHEDULE_REPLAN';

export interface ApprovalRequest {
  id: string;
  type: ApprovalRequestType;
  projectId?: string;
  taskId?: string;
  requestedBy: UserId;
  pmId?: UserId;
  managerId?: UserId;
  status: 'PENDING' | 'PM_REVIEWING' | 'PM_APPROVED' | 'MANAGER_REVIEWING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  title: string;
  reason: string;
  requestedStartDate?: string;
  requestedDueDate?: string;
  reviewedBy?: UserId;
  reviewComment?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ScheduleType = 'PERSONAL_WORK' | 'MEETING' | 'REVIEW' | 'CLIENT_MEETING' | 'INTERNAL_REPORT' | 'PM_PLANNING' | 'MANAGER_REVIEW' | 'DEPARTMENT_MANAGEMENT' | 'ETC' | 'OFF';

export interface PersonalSchedule {
  id: string;
  userId: UserId;
  ownerRole: Role;
  departmentId: DepartmentId;
  title: string;
  description?: string;
  scheduleType: ScheduleType;
  startDateTime: string;
  endDateTime: string;
  isAllDay: boolean;
  visibility: 'PRIVATE' | 'DEPARTMENT' | 'PROJECT_MEMBERS' | 'MANAGER_ONLY' | 'SUPER_ADMIN_ONLY';
  status: 'SCHEDULED' | 'CHANGED' | 'CANCELLED' | 'COMPLETED';
  createdBy?: UserId;
  updatedBy?: UserId;
  changeNotifyTargetIds?: UserId[];
  requiresApproval?: boolean;
  approvalStatus?: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  relatedProjectId?: string;
  relatedTaskId?: string;
  sourceSheet?: string;
  sourceMonth?: number;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Notification {
  id: string;
  userId: UserId;
  type: string;
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';
  relatedProjectId?: string;
  relatedTaskId?: string;
  relatedApprovalId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: UserId;
  action: string;
  entityType: string;
  entityId: string;
  beforeValue?: string;
  afterValue?: string;
  message: string;
  createdAt: string;
}
