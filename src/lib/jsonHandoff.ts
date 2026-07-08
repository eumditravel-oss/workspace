import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import { useSettingStore } from '@/store/settingStore';

export interface WorkspaceExportData {
  schemaVersion: string;
  exportedAt: string;
  exportedBy: string;
  data: {
    projects: any[];
    tasks: any[];
    personnel: any[];
    settings: any;
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

export const downloadJson = (data: any, filename: string) => {
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

export const validateImportData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  if (data.schemaVersion !== "1.0.0") return false;
  if (!data.data || !Array.isArray(data.data.projects)) return false;
  return true;
};

export const applyImportData = (data: WorkspaceExportData) => {
  // To strictly apply imported data, we would need setter functions in stores.
  // For MVP, we will assume stores have a method to reset or we just alert for now.
  // We can add reset methods to stores if needed.
  console.log("Applying data:", data);
  alert("데이터 구조가 유효합니다. (실제 덮어쓰기 구현은 스토어 확장 필요)");
};
