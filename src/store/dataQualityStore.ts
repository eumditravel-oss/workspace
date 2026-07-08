import { create } from 'zustand';
import { DataQualityCheck } from '@/types/models';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

interface DataQualityState {
  checks: DataQualityCheck[];
  lastCheckTime: string | null;
  runChecks: () => void;
  resolveCheck: (checkId: string) => void;
  ignoreCheck: (checkId: string) => void;
}

export const useDataQualityStore = create<DataQualityState>((set) => ({
  checks: [],
  lastCheckTime: null,
  
  runChecks: () => set((state) => {
    const { projects } = useProjectStore.getState();
    const { tasks } = useTaskStore.getState();
    const { users } = useAuthStore.getState();
    
    const newChecks: DataQualityCheck[] = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // 1. Projects
    projects.forEach(p => {
      if (p.status !== 'COMPLETED' && p.status !== 'ARCHIVED' && p.deliveryDate) {
        const dDate = new Date(p.deliveryDate);
        if (dDate < today) {
          newChecks.push({
            id: `dq-proj-overdue-${p.id}`,
            category: 'PROJECT',
            severity: 'ERROR',
            title: '납품일 경과 미완료 프로젝트',
            description: `프로젝트 "${p.title}"의 납품일(${p.deliveryDate})이 지났으나 완료되지 않았습니다.`,
            relatedEntityType: 'Project',
            relatedEntityId: p.id,
            detectedAt: new Date().toISOString(),
            status: 'OPEN',
            suggestedFix: '프로젝트를 완료 처리하거나 납품일을 연장하세요.'
          });
        }
      }
      
      if (!p.pmId && p.startDate) {
        const sDate = new Date(p.startDate);
        if (sDate <= nextWeek) {
          newChecks.push({
            id: `dq-proj-nopm-${p.id}`,
            category: 'PROJECT',
            severity: 'WARNING',
            title: 'PM 미배정 임박 프로젝트',
            description: `프로젝트 "${p.title}"의 시작일이 임박했으나 PM이 없습니다.`,
            relatedEntityType: 'Project',
            relatedEntityId: p.id,
            detectedAt: new Date().toISOString(),
            status: 'OPEN',
            suggestedFix: 'PM을 배정하세요.'
          });
        }
      }
    });

    // 2. Tasks
    tasks.forEach(t => {
      if (t.assigneeId) {
        const userExists = users.some(u => u.id === t.assigneeId);
        if (!userExists) {
          newChecks.push({
            id: `dq-task-orphan-${t.id}`,
            category: 'PERSONNEL',
            severity: 'BLOCKER',
            title: '직원명 매칭 실패',
            description: `업무 "${t.title}"에 할당된 작업자 ID(${t.assigneeId})가 직원 목록에 없습니다.`,
            relatedEntityType: 'Task',
            relatedEntityId: t.id,
            detectedAt: new Date().toISOString(),
            status: 'OPEN',
            suggestedFix: '작업자를 다시 지정하세요.'
          });
        }
      } else if (t.startDate) {
        const sDate = new Date(t.startDate);
        if (sDate <= nextWeek && t.status !== 'DONE' && t.status !== 'REJECTED') {
          newChecks.push({
            id: `dq-task-noassignee-${t.id}`,
            category: 'SCHEDULE',
            severity: 'WARNING',
            title: '작업자 미배정 임박 업무',
            description: `업무 "${t.title}" 시작일이 임박했으나 담당자가 없습니다.`,
            relatedEntityType: 'Task',
            relatedEntityId: t.id,
            detectedAt: new Date().toISOString(),
            status: 'OPEN',
            suggestedFix: '작업자를 배정하세요.'
          });
        }
      }
    });

    // 3. Personnel
    users.forEach(u => {
      if (!u.departmentId) {
        newChecks.push({
          id: `dq-user-nodept-${u.id}`,
          category: 'PERSONNEL',
          severity: 'ERROR',
          title: '필수 정보 누락 직원',
          description: `직원 "${u.name}"의 공통 부서 정보가 누락되었습니다.`,
          relatedEntityType: 'Personnel',
          relatedEntityId: u.id,
          detectedAt: new Date().toISOString(),
          status: 'OPEN',
          suggestedFix: '인사카드에서 부서를 지정하세요.'
        });
      }
    });

    // Merge with existing statuses (e.g. IGNORED, RESOLVED)
    const mergedChecks = newChecks.map(nc => {
      const existing = state.checks.find(c => c.id === nc.id);
      if (existing && (existing.status === 'IGNORED' || existing.status === 'RESOLVED')) {
        return { ...nc, status: existing.status };
      }
      return nc;
    });

    const criticalChecks = newChecks.filter(c => c.severity === 'ERROR' || c.severity === 'BLOCKER');
    if (criticalChecks.length > 0) {
      const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN' || u.systemRole === 'SUPER_ADMIN');
      superAdmins.forEach(admin => {
        useNotificationStore.getState().addNotification({
          userId: admin.id,
          type: 'SYSTEM',
          title: '데이터 품질 스캔 결과',
          message: `심각한 데이터 품질 문제 ${criticalChecks.length}건이 발견되었습니다.`,
          priority: 'HIGH'
        });
      });
    }

    alert('데이터 품질 검사가 완료되었습니다.');

    return {
      checks: mergedChecks,
      lastCheckTime: new Date().toISOString()
    };
  }),
  
  resolveCheck: (checkId) => set((state) => ({
    checks: state.checks.map(c => c.id === checkId ? { ...c, status: 'RESOLVED' } : c)
  })),
  
  ignoreCheck: (checkId) => set((state) => ({
    checks: state.checks.map(c => c.id === checkId ? { ...c, status: 'IGNORED' } : c)
  })),
}));
