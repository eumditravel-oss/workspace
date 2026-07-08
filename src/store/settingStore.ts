import { create } from 'zustand';
import { WorkspaceSetting } from '@/types/models';

interface SettingState {
  settings: WorkspaceSetting[];
  updateSetting: (key: string, value: string | number | boolean | Record<string, string>, updatedBy: string) => void;
}

const defaultSettings: WorkspaceSetting[] = [
  {
    id: 'setting-001',
    category: 'POLICY',
    key: 'DELIVERY_URGENT_DAYS',
    value: 3,
    description: '납품 임박 상태(URGENT)로 표시할 기준 일수',
    editableByRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'setting-002',
    category: 'MAPPING',
    key: 'SCOPE_NORMALIZATION',
    value: { 'Drafting (T1)': 'Drafting', 'Mod (T1)': 'Mod' },
    description: 'Excel Import 시 Scope 정규화 매핑 테이블',
    editableByRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN'],
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'setting-003',
    category: 'WORKFLOW',
    key: 'ALLOW_SCHEDULE_CONFLICT',
    value: false,
    description: '직원의 일별 잔여 시간을 초과하는 스케줄 할당 허용 여부',
    editableByRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'DEPARTMENT_MANAGER'],
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'setting-004',
    category: 'UI',
    key: 'DEFAULT_BOARD_VIEW',
    value: 'BY_STATUS',
    description: '프로젝트 보드 기본 뷰 모드',
    editableByRoles: ['SUPER_ADMIN', 'SYSTEM_ADMIN', 'PM', 'DEPARTMENT_MANAGER'],
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'setting-delivery-001',
    category: 'DELIVERY',
    key: 'DELIVERY_AUTO_CLOSE_OVERDUE_PROJECTS',
    value: true,
    description: '납품일 경과 시 자동 완료 컬럼 분류 여부',
    editableByRoles: ['SUPER_ADMIN'],
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'setting-delivery-002',
    category: 'DELIVERY',
    key: 'DELIVERY_SHOW_COMPLETED_WITH_PENDING_WARNINGS',
    value: true,
    description: '완료 컬럼 프로젝트에 미결 요청 경고 표시 여부',
    editableByRoles: ['SUPER_ADMIN'],
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'setting-delivery-003',
    category: 'DELIVERY',
    key: 'DELIVERY_ALLOW_POST_DELIVERY_WORK_REQUEST',
    value: true,
    description: '납품일 경과 후 추가업무 요청 허용 여부',
    editableByRoles: ['SUPER_ADMIN'],
    updatedBy: 'system',
    updatedAt: new Date().toISOString()
  }
];

export const useSettingStore = create<SettingState>((set) => ({
  settings: defaultSettings,
  updateSetting: (key, value, updatedBy) => set((state) => ({
    settings: state.settings.map(s => 
      s.key === key ? { ...s, value, updatedBy, updatedAt: new Date().toISOString() } : s
    )
  })),
}));
