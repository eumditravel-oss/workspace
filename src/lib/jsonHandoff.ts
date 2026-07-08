import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { useSettingStore } from '@/store/settingStore';

import { Project, TaskCard, PersonnelCard, WorkspaceSetting } from '@/types/models';

export interface WorkspaceExportData {
  schemaVersion: string;
  exportedAt: string;
  exportedBy: string;
  data: {
    projects: Project[];
    tasks: TaskCard[];
    personnel: PersonnelCard[];
    settings: WorkspaceSetting[];
  };
}

export const exportWorkspaceData = (): WorkspaceExportData => {
  const { projects } = useProjectStore.getState();
  const { tasks } = useTaskStore.getState();
  const { users, currentUser } = useAuthStore.getState();
  const settings = useSettingStore.getState().settings;

  return {
    schemaVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    exportedBy: currentUser?.displayName || "System",
    data: {
      projects,
      tasks,
      personnel: users,
      settings
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
  return true;
};

import { useScheduleStore } from '@/store/scheduleStore';

export const applyImportData = (data: WorkspaceExportData) => {
  if (!validateImportData(data)) {
    alert("데이터 구조가 유효하지 않습니다.");
    return false;
  }
  
  useProjectStore.getState().replaceProjects(data.data.projects || []);
  useTaskStore.getState().replaceTasks(data.data.tasks || []);
  
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
