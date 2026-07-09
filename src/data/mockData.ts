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
    email: 'admin@con-cost.com',
    phone: '010-0000-0001',
    companyId: 'CON_COST',
    departmentId: 'DEVELOP',
    position: '이사',
    jobTitle: 'Super Admin',
    role: 'SUPER_ADMIN',
    systemRole: 'SUPER_ADMIN',
    organizationRank: 'CEO',
    permissionLevel: 100,
    employmentStatus: 'ACTIVE',
    availableWorkHoursPerDay: 8,
  },
  {
    id: 'user-manager-structure-vn',
    employeeNumber: 'VN-MGR-001',
    name: 'VN Structure Manager',
    displayName: '구조팀 부서장',
    email: 'vn-mgr@con-cost.com',
    phone: '010-0000-0002',
    companyId: 'VIET_QS',
    departmentId: 'STRUCTURE',
    position: '부장',
    jobTitle: 'VN Structure Team Manager',
    role: 'DEPARTMENT_MANAGER',
    systemRole: 'DEPARTMENT_MANAGER',
    organizationRank: 'MANAGER',
    permissionLevel: 80,
    employmentStatus: 'ACTIVE',
    availableWorkHoursPerDay: 8,
  },
  {
    id: 'user-pm-structure-vn',
    employeeNumber: 'VN-PM-001',
    name: 'VN Structure PM',
    displayName: '구조팀 PM',
    email: 'vn-pm@con-cost.com',
    phone: '010-0000-0003',
    companyId: 'VIET_QS',
    departmentId: 'STRUCTURE',
    position: '차장',
    jobTitle: 'VN Structure PM',
    role: 'PM',
    systemRole: 'PM',
    organizationRank: 'PM',
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
