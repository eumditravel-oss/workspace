import { ProcessTemplate, ProcessStage, ProcessTask } from '@/types/models';

export const defaultProcessTemplates: ProcessTemplate[] = [
  {
    id: 'ptmpl_standard_esc',
    name: '표준 ESC 공정 템플릿',
    description: '일반적인 ESC 설계 및 도서산출 공정',
    isDefault: true,
  }
];

export const defaultProcessStages: ProcessStage[] = [
  { id: 'pstage_1', templateId: 'ptmpl_standard_esc', name: '설계공정', orderIndex: 1 },
  { id: 'pstage_2', templateId: 'ptmpl_standard_esc', name: '도서산출', orderIndex: 2 },
  { id: 'pstage_3', templateId: 'ptmpl_standard_esc', name: '수량산출', orderIndex: 3 },
  { id: 'pstage_4', templateId: 'ptmpl_standard_esc', name: '제출/마감', orderIndex: 4 },
];

export const defaultProcessTasks: ProcessTask[] = [
  { id: 'ptask_1_1', stageId: 'pstage_1', name: '설계도면 수령', orderIndex: 1, defaultAssigneeRole: 'PM' },
  { id: 'ptask_1_2', stageId: 'pstage_1', name: '도면 검토 및 질의', orderIndex: 2, defaultAssigneeRole: 'WORKER' },
  { id: 'ptask_2_1', stageId: 'pstage_2', name: '구조 산출', orderIndex: 1, defaultAssigneeRole: 'WORKER' },
  { id: 'ptask_2_2', stageId: 'pstage_2', name: '건축 산출', orderIndex: 2, defaultAssigneeRole: 'WORKER' },
  { id: 'ptask_3_1', stageId: 'pstage_3', name: '내역서 작성', orderIndex: 1, defaultAssigneeRole: 'WORKER' },
  { id: 'ptask_3_2', stageId: 'pstage_3', name: '단가 확인', orderIndex: 2, defaultAssigneeRole: 'PM' },
  { id: 'ptask_4_1', stageId: 'pstage_4', name: '최종 검수 (QC)', orderIndex: 1, defaultAssigneeRole: 'DEPARTMENT_MANAGER' },
  { id: 'ptask_4_2', stageId: 'pstage_4', name: '납품 (Delivery)', orderIndex: 2, defaultAssigneeRole: 'PM' },
];
