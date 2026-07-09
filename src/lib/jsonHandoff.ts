import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { useSettingStore } from '@/store/settingStore';
import { useApprovalStore } from '@/store/approvalStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useTranslationStore } from '@/store/translationStore';
import { useAuditStore } from '@/store/auditStore';

import { Project, TaskCard, PersonnelCard, WorkspaceSetting, TaskWorkSegment, ApprovalRequest, RevisionRequest, PostDeliveryWorkRequest, Notification, PersonalSchedule, WorkspaceLanguage, TranslationProviderHealth, TranslationCacheItem, AuditLog } from '@/types/models';
import { TranslationSettings } from '@/store/translationStore';

export interface WorkspaceExportData {
  schemaVersion: string;
  exportedAt: string;
  exportedBy: string;
  data: {
    projects: Project[];
    tasks: TaskCard[];
    taskWorkSegments: TaskWorkSegment[];
    personnel: PersonnelCard[];
    settings: WorkspaceSetting[];
    approvalRequests: ApprovalRequest[];
    revisionRequests: RevisionRequest[];
    postDeliveryWorkRequests: PostDeliveryWorkRequest[];
    notifications: Notification[];
    personalSchedules: PersonalSchedule[];
    workspaceLanguage?: WorkspaceLanguage;
    translationSettings?: TranslationSettings;
    translationProviderHealths?: Record<string, TranslationProviderHealth>;
    translationCache?: TranslationCacheItem[];
    auditLogs: AuditLog[];
  };
}

export const exportWorkspaceData = (): WorkspaceExportData => {
  const { projects, revisionRequests, postDeliveryWorkRequests } = useProjectStore.getState();
  const { tasks, workSegments } = useTaskStore.getState();
  const { users, currentUser } = useAuthStore.getState();
  const settings = useSettingStore.getState().settings;
  const { requests: approvalRequests } = useApprovalStore.getState();
  const { notifications } = useNotificationStore.getState();
  const { schedules: personalSchedules } = useScheduleStore.getState();
  const { settings: translationSettings, providerHealths, translationCache } = useTranslationStore.getState();
  const { logs: auditLogs } = useAuditStore.getState();

  // Sanitize secrets before export
  const sanitizedTranslationSettings = { ...translationSettings };
  delete sanitizedTranslationSettings.myMemoryContactEmail;
  delete sanitizedTranslationSettings.libreTranslateEndpoint; // Optional: keep or remove depending on security, prompt says "endpoint URL은 포함 가능하지만, Secret은 포함 금지." We'll keep endpoint but remove email.
  
  return {
    schemaVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    exportedBy: currentUser?.displayName || "System",
    data: {
      projects,
      tasks,
      taskWorkSegments: workSegments,
      personnel: users,
      settings,
      approvalRequests,
      revisionRequests,
      postDeliveryWorkRequests,
      notifications,
      personalSchedules,
      workspaceLanguage: translationSettings.uiLanguage,
      translationSettings: sanitizedTranslationSettings,
      translationProviderHealths: providerHealths,
      translationCache,
      auditLogs
    }
  };
};

export const downloadJson = (data: unknown, filename: string) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const saveDraftToLocalStorage = () => {
  const data = exportWorkspaceData();
  localStorage.setItem('workspace_draft', JSON.stringify(data));
  return true;
};

export const loadDraftFromLocalStorage = (): WorkspaceExportData | null => {
  const dataStr = localStorage.getItem('workspace_draft');
  if (!dataStr) return null;
  try {
    const data = JSON.parse(dataStr);
    if (data.schemaVersion) return data;
    return null;
  } catch (e) {
    return null;
  }
};

export const validateImportData = (data: unknown): data is WorkspaceExportData => {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  if (d.schemaVersion !== "1.0.0") return false;
  if (!d.data || typeof d.data !== 'object' || !Array.isArray((d.data as Record<string, unknown>).projects)) return false;
  
  const typedData = d.data as WorkspaceExportData['data'];
  
  // Validation: projectSourceType and dates
  const isValidProjects = typedData.projects.every(p => {
    if (p.projectSourceType === 'INTERNAL_DEVELOPMENT' && !p.targetDate) return false;
    if (p.projectSourceType === 'CLIENT_ORDER' && !p.deliveryDate) return false;
    return true;
  });
  if (!isValidProjects) return false;

  // Validation: Task References
  const projectIds = new Set(typedData.projects.map(p => p.id));
  const userIds = new Set((typedData.personnel || []).map(u => u.id));
  
  if (typedData.tasks) {
    const isValidTasks = typedData.tasks.every(t => {
      if (!projectIds.has(t.projectId)) return false;
      if (t.assigneeId && !userIds.has(t.assigneeId)) return false;
      return true;
    });
    if (!isValidTasks) return false;
  }
  
  return true;
};
export const applyImportData = (data: WorkspaceExportData) => {
  if (!validateImportData(data)) {
    alert("데이터 구조가 유효하지 않습니다.");
    return false;
  }
  
  useProjectStore.getState().replaceProjects(data.data.projects || []);
  if (data.data.revisionRequests) useProjectStore.setState({ revisionRequests: data.data.revisionRequests });
  if (data.data.postDeliveryWorkRequests) useProjectStore.setState({ postDeliveryWorkRequests: data.data.postDeliveryWorkRequests });
  
  useTaskStore.getState().replaceTasks(data.data.tasks || []);
  if (data.data.taskWorkSegments) {
    // Custom replace function would go here, fallback to internal reset/replace if available
    useTaskStore.setState({ workSegments: data.data.taskWorkSegments });
  }

  if (data.data.approvalRequests) {
    useApprovalStore.getState().replaceRequests(data.data.approvalRequests);
  }

  if (data.data.notifications) {
    useNotificationStore.setState({ notifications: data.data.notifications });
  }

  if (data.data.personalSchedules) {
    useScheduleStore.getState().replaceSchedules(data.data.personalSchedules);
  }
  
  if (data.data.auditLogs) {
    useAuditStore.getState().replaceLogs(data.data.auditLogs);
  }
  
  if (data.data.personnel && data.data.personnel.length > 0) {
    useAuthStore.getState().replaceUsers(data.data.personnel);
  }
  
  if (data.data.settings && data.data.settings.length > 0) {
    useSettingStore.getState().replaceSettings(data.data.settings);
  }
  
  useAuthStore.getState().setDataSourceMode('EXCEL_IMPORT_DATA');
  alert("데이터가 성공적으로 반영되었습니다.");
  return true;
};
