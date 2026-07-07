import { PersonnelCard, Project, TaskCard, ApprovalRequest, Notification, AuditLog, PersonalSchedule } from '@/types/models';
import { 
  samplePersonnelCards, 
  sampleProjects, 
  sampleTaskCards, 
  samplePersonalSchedules 
} from './workspaceScheduleSeed';

export const coreUsers: PersonnelCard[] = [
  {
    id: 'u1-super',
    employeeNumber: 'HQ-001',
    name: 'System Admin',
    displayName: '최고 관리자',
    email: 'admin@eumdi.com',
    phone: '010-0000-0001',
    departmentId: 'dept-hq',
    departmentName: '본사',
    position: '이사',
    jobTitle: 'Super Admin',
    role: 'SUPER_ADMIN',
    permissionLevel: 100,
    employmentStatus: 'ACTIVE',
    availableWorkHoursPerDay: 8,
  },
  {
    id: 'user-manager-structure-vn',
    employeeNumber: 'VN-MGR-001',
    name: 'VN Structure Manager',
    displayName: '구조팀 부서장',
    email: 'vn-mgr@eumdi.com',
    phone: '010-0000-0002',
    departmentId: 'dept-structure-vn',
    departmentName: 'VN Structure Team',
    position: '부장',
    jobTitle: 'VN Structure Team Manager',
    role: 'DEPARTMENT_MANAGER',
    permissionLevel: 80,
    employmentStatus: 'ACTIVE',
    availableWorkHoursPerDay: 8,
  },
  {
    id: 'user-pm-structure-vn',
    employeeNumber: 'VN-PM-001',
    name: 'VN Structure PM',
    displayName: '구조팀 PM',
    email: 'vn-pm@eumdi.com',
    phone: '010-0000-0003',
    departmentId: 'dept-structure-vn',
    departmentName: 'VN Structure Team',
    position: '차장',
    jobTitle: 'VN Structure PM',
    role: 'PM',
    permissionLevel: 50,
    managerId: 'user-manager-structure-vn',
    employmentStatus: 'ACTIVE',
    availableWorkHoursPerDay: 8,
  }
];

export const mockUsers: PersonnelCard[] = [...coreUsers, ...samplePersonnelCards];

export const mockProjects: Project[] = [...sampleProjects];

export const mockTasks: TaskCard[] = [...sampleTaskCards];

export const mockPersonalSchedules: PersonalSchedule[] = [...samplePersonalSchedules];

export const mockApprovalRequests: ApprovalRequest[] = [];
export const mockNotifications: Notification[] = [];
export const mockAuditLogs: AuditLog[] = [];
