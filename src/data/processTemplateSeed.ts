import { ProcessTemplate, ProcessStage, ProcessTask } from '@/types/models';

export const defaultProcessTemplates: ProcessTemplate[] = [
  {
    id: 'ptmpl_esc_vietnam',
    name: 'ESC 공정 템플릿 (GĐ 0~5)',
    description: '베트남 설계본부 표준 6단계 ESC 공정',
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const defaultProcessStages: ProcessStage[] = [
  { id: 'pstage_gd0', templateId: 'ptmpl_esc_vietnam', name: 'GĐ 0 (준비/도면 파악)', orderIndex: 0 },
  { id: 'pstage_gd1', templateId: 'ptmpl_esc_vietnam', name: 'GĐ 1 (모델링)', orderIndex: 1 },
  { id: 'pstage_gd2', templateId: 'ptmpl_esc_vietnam', name: 'GĐ 2 (배근/상세)', orderIndex: 2 },
  { id: 'pstage_gd3', templateId: 'ptmpl_esc_vietnam', name: 'GĐ 3 (거푸집/마감)', orderIndex: 3 },
  { id: 'pstage_gd4', templateId: 'ptmpl_esc_vietnam', name: 'GĐ 4 (물량 산출/내역)', orderIndex: 4 },
  { id: 'pstage_gd5', templateId: 'ptmpl_esc_vietnam', name: 'GĐ 5 (QC 및 납품)', orderIndex: 5 },
];

export const defaultProcessTasks: ProcessTask[] = [
  // GĐ 0
  { id: 'ptask_gd0_1', stageId: 'pstage_gd0', name: '도면 검토 및 질의서 작성', orderIndex: 1, defaultAssigneeRole: 'PM' },
  { id: 'ptask_gd0_2', stageId: 'pstage_gd0', name: '작업 환경 세팅', orderIndex: 2, defaultAssigneeRole: 'WORKER' },
  
  // GĐ 1
  { id: 'ptask_gd1_1', stageId: 'pstage_gd1', name: '기본 골조 모델링', orderIndex: 1, defaultAssigneeRole: 'WORKER' },
  { id: 'ptask_gd1_2', stageId: 'pstage_gd1', name: '모델링 크로스 체크', orderIndex: 2, defaultAssigneeRole: 'WORKER' },

  // GĐ 2
  { id: 'ptask_gd2_1', stageId: 'pstage_gd2', name: '철근 배근 및 샵 드로잉', orderIndex: 1, defaultAssigneeRole: 'WORKER' },
  { id: 'ptask_gd2_2', stageId: 'pstage_gd2', name: '조인트 및 상세 검토', orderIndex: 2, defaultAssigneeRole: 'WORKER' },

  // GĐ 3
  { id: 'ptask_gd3_1', stageId: 'pstage_gd3', name: '거푸집 및 동바리 검토', orderIndex: 1, defaultAssigneeRole: 'WORKER' },
  { id: 'ptask_gd3_2', stageId: 'pstage_gd3', name: '마감 물량 검토', orderIndex: 2, defaultAssigneeRole: 'WORKER' },

  // GĐ 4
  { id: 'ptask_gd4_1', stageId: 'pstage_gd4', name: '자동 물량 산출 (BOM)', orderIndex: 1, defaultAssigneeRole: 'WORKER' },
  { id: 'ptask_gd4_2', stageId: 'pstage_gd4', name: '수기 물량(누락분) 입력', orderIndex: 2, defaultAssigneeRole: 'WORKER' },

  // GĐ 5
  { id: 'ptask_gd5_1', stageId: 'pstage_gd5', name: '도서 일치 여부 및 최종 검수(QC)', orderIndex: 1, defaultAssigneeRole: 'DEPARTMENT_MANAGER' },
  { id: 'ptask_gd5_2', stageId: 'pstage_gd5', name: '고객사 납품 (Delivery)', orderIndex: 2, defaultAssigneeRole: 'PM' },
];
