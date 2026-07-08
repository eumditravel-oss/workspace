import { create } from 'zustand';
import { DataQualityCheck } from '@/types/models';

interface DataQualityState {
  checks: DataQualityCheck[];
  lastCheckTime: string | null;
  runChecks: () => void;
  resolveCheck: (checkId: string) => void;
  ignoreCheck: (checkId: string) => void;
}

const mockChecks: DataQualityCheck[] = [
  {
    id: 'dq-001',
    category: 'PERSONNEL',
    severity: 'BLOCKER',
    title: '직원명 매칭 실패 (고아 데이터)',
    description: '작업 일정에 NGUYEN VAN A가 할당되었으나 직원 마스터에 존재하지 않습니다.',
    detectedAt: new Date().toISOString(),
    status: 'OPEN',
    suggestedFix: '해당 일정을 삭제하거나 직원을 추가하세요.'
  },
  {
    id: 'dq-002',
    category: 'PROJECT',
    severity: 'ERROR',
    title: 'PM 미배정 프로젝트 존재',
    description: '프로젝트 "Sangin cheon"에 PM이 할당되지 않아 결재를 진행할 수 없습니다.',
    relatedEntityType: 'Project',
    relatedEntityId: 'project-sangincheon',
    detectedAt: new Date().toISOString(),
    status: 'OPEN',
    suggestedFix: '프로젝트 설정에서 PM을 지정하세요.'
  },
  {
    id: 'dq-003',
    category: 'SCHEDULE',
    severity: 'WARNING',
    title: '동일 직원 동일 날짜 중복 일정',
    description: '직원 LÝ THANH PHONG의 2026-01-02 일정에 두 개의 프로젝트 업무가 8시간씩 할당되어 초과 근무 상태입니다.',
    relatedEntityType: 'Personnel',
    relatedEntityId: 'user-lthanhphong',
    detectedAt: new Date().toISOString(),
    status: 'OPEN',
  },
  {
    id: 'dq-004',
    category: 'BOARD',
    severity: 'ERROR',
    title: '납품일 경과 배지 오류 감지',
    description: '과거 납품일 프로젝트에 "납품 1주일 전" 배지가 표시되고 있습니다.',
    relatedEntityType: 'Project',
    detectedAt: new Date().toISOString(),
    status: 'OPEN',
    suggestedFix: '최신 배지 산정 로직을 적용하세요.'
  },
  {
    id: 'dq-005',
    category: 'BOARD',
    severity: 'WARNING',
    title: '미결 요청이 있는 완료 프로젝트',
    description: '완료 컬럼에 위치한 프로젝트에 처리되지 않은 사후 추가업무 요청이 있습니다.',
    relatedEntityType: 'Project',
    detectedAt: new Date().toISOString(),
    status: 'OPEN',
    suggestedFix: '요청을 결재하여 사후 추가업무를 승인하거나 반려하세요.'
  }
];

export const useDataQualityStore = create<DataQualityState>((set) => ({
  checks: mockChecks,
  lastCheckTime: new Date().toISOString(),
  
  runChecks: () => {
    // In MVP, this would just refresh the mock checks or trigger a scan across other Zustand stores
    set({ lastCheckTime: new Date().toISOString() });
    alert('데이터 품질 검사가 완료되었습니다.');
  },
  
  resolveCheck: (checkId) => set((state) => ({
    checks: state.checks.map(c => c.id === checkId ? { ...c, status: 'RESOLVED' } : c)
  })),
  
  ignoreCheck: (checkId) => set((state) => ({
    checks: state.checks.map(c => c.id === checkId ? { ...c, status: 'IGNORED' } : c)
  })),
}));
