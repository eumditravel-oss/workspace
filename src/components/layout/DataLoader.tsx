"use client";

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useScheduleStore } from '@/store/scheduleStore';
import { useSettingStore } from '@/store/settingStore';
import { useApprovalStore } from '@/store/approvalStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useEvaluationStore } from '@/store/evaluationStore';
import { operationData } from '@/data/operationData';
import { mockUsers } from '@/data/mockData';
import { fullProjects, fullTasks, fullSchedules } from '@/data/fullScheduleSeed';

export function DataLoader() {
  const dataSourceMode = useAuthStore(state => state.dataSourceMode);
  
  const replaceProjects = useProjectStore(state => state.replaceProjects);
  const resetProjects = useProjectStore(state => state.resetProjects);
  
  const replaceTasks = useTaskStore(state => state.replaceTasks);
  const resetTasks = useTaskStore(state => state.resetTasks);
  
  const replaceUsers = useAuthStore(state => state.replaceUsers);
  const resetUsers = useAuthStore(state => state.resetUsers);
  
  const replaceSchedules = useScheduleStore(state => state.replaceSchedules);
  const resetSchedules = useScheduleStore(state => state.resetSchedules);
  
  const replaceSettings = useSettingStore(state => state.replaceSettings);
  const resetSettings = useSettingStore(state => state.resetSettings);
  
  const replaceRequests = useApprovalStore(state => state.replaceRequests);
  const resetRequests = useApprovalStore(state => state.resetRequests);
  
  const replaceNotifications = useNotificationStore(state => state.replaceNotifications);
  const resetNotifications = useNotificationStore(state => state.resetNotifications);

  // We only run the loader when dataSourceMode changes.
  // To avoid infinite loops or overwriting user interactions constantly, we load once per mode change.
  const prevMode = useRef<string | null>(null);

  useEffect(() => {
    if (prevMode.current === dataSourceMode) return;
    prevMode.current = dataSourceMode;

    switch (dataSourceMode) {
      case 'JSON_OPERATION_DATA':
        if (operationData && operationData.data) {
          replaceProjects(operationData.data.projects || []);
          replaceTasks(operationData.data.tasks || []);
          replaceUsers(operationData.data.personnel || []);
          // Operation data might not have all types yet, fallback if needed
          replaceSettings(operationData.data.settings ? [operationData.data.settings as any] : []);
        } else {
          // EMPTY fallback as per requirements: "JSON 운영 데이터가 없으면 ... 조용히 demo fallback되지 않고 empty state가 되게 한다."
          resetProjects();
          resetTasks();
          resetUsers();
          resetSchedules();
          resetSettings();
          resetRequests();
          resetNotifications();
        }
        break;

      case 'DEMO_SEED_DATA':
        // Load mock/full seed data for testing
        replaceProjects(fullProjects);
        replaceTasks(fullTasks);
        replaceUsers(mockUsers);
        replaceSchedules(fullSchedules);
        // Do not reset settings to empty, let's keep current or load defaults, for now just skip settings/approvals
        break;

      case 'EMPTY':
        resetProjects();
        resetTasks();
        resetUsers();
        resetSchedules();
        resetSettings();
        resetRequests();
        resetNotifications();
        break;
        
      case 'EXCEL_IMPORT_DATA':
        // The store is manipulated via ImportPreview Apply button. We don't overwrite it here.
        break;
    }
  }, [dataSourceMode, replaceProjects, resetProjects, replaceTasks, resetTasks, replaceUsers, resetUsers, replaceSchedules, resetSchedules, replaceSettings, resetSettings, replaceRequests, resetRequests, replaceNotifications, resetNotifications]);

  return null;
}
