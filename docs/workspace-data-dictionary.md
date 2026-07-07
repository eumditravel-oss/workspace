# Workspace Data Dictionary

이 문서는 EUMDI OS 워크스페이스의 통합 데이터 모델 설계 기준으로, 시스템 내 모든 엔티티의 용도와 관계, 상태값 분류, 일정 데이터 처리 방식을 규정합니다. 모든 데이터 관련 추가 및 수정은 이 기준을 따라야 합니다.

## 1. Entity Overview
전체 시스템의 엔티티는 핵심 로직 구동에 필수적인 Core MVP Entities와 추가/고도화 기능에 사용되는 Extension Entities로 나뉩니다. 중복되거나 유사한 목적을 가진 모델은 통폐합하여 복잡도를 낮춥니다.

## 2. Core MVP Entities
초기 핵심 파이프라인(프로젝트 생성-배정-스케줄-완료)에 필수적인 모델들입니다.
- **User**: 기본 사용자 계정 정보
- **Department**: 부서/조직도 정보
- **Project**: 업무 파이프라인 최상위 단위 (목표, 공기)
- **TaskCard**: 실제 프로젝트를 구성하는 보드 단위 업무 카드
- **SchedulePlan**: 프로젝트 전체 공정 계획 및 승인 단위
- **ApprovalRequest**: 휴가, 초과근무, 프로젝트 완료 등 각종 승인/결재 건
- **Notification**: 시스템 내 알림 이벤트 메시지
- **AuditLog**: 시스템에서 발생한 중요 액션/변경 사항 기록
- **PersonnelCard**: 직원별 세부 정보, 권한 레벨 및 소속 메타데이터 (User 확장)
- **PersonalSchedule**: 휴가, 대휴, 교육 등 직원의 개인 일정
- **ScheduleAssignment**: VN 베트남 Excel 공정표 등에서 추출된 일일 작업 배정 내역

## 3. Extension Entities
향후 단계적 도입을 위해 예약된 확장 모델들입니다.
- **ChangeRequest**: 공정표나 스펙 변경 등 정식 이력 관리를 요하는 변경 요청
- **TaskChecklistItem**: TaskCard 내의 세부 할 일 항목
- **TaskArtifact**: 업무 산출물 (링크, 배포본 등)
- **AbsenceSchedule**: 장기 부재/파견 일정 관리 (PersonalSchedule 특수 형태)
- **DelegationRule**: 결재나 업무 권한 대리 위임 규칙
- **ReassignmentRequest**: 담당자 재배정 요청
- **VersionSnapshot**: 이전 상태로의 롤백 또는 비교를 위한 전체/부분 스냅샷
- **SavedView**: 보드/필터 조건 개인 저장
- **Attachment**: 시스템 내 범용 파일 첨부 관리
- **BackupRecord**: 데이터베이스/시스템 단위 백업 이력
- **ProgressUpdate**: 업무 진행률 갱신 시 작성되는 구체적인 변경 로그/일지
- **TaskBlocker**: 업무 진행을 가로막는 장애 요소 (이슈트래킹 연동)
- **Client**: 외부 고객/발주처 관리 (초기 MVP 접속권한 없음)
- **DigestNotification**: 개별 알림들을 주기별(일간/주간)로 요약한 알림
- **NotificationPreference**: 사용자별 알림 수신 설정

## 4. Entity Relationship Map
- 1:N 구조 중심: 
  - `Project` (1) - `TaskCard` (N)
  - `Project` (1) - `SchedulePlan` (N - 이력 누적, 1 active)
  - `TaskCard` (1) - `ScheduleAssignment` (N)
  - `PersonnelCard` (1) - `PersonalSchedule` (N)
- M:N 또는 다중 연결: 
  - `ApprovalRequest`는 다형성을 통해 Project, TaskCard, PersonalSchedule 등과 연결

## 5. Status Taxonomy
혼동하기 쉬운 상태값들을 엔티티별로 명확히 분류합니다.

- **Project.status (수명주기 상태)**: 
  `INTAKE_RECEIVED` -> `MANAGER_REVIEW` -> `PM_ASSIGNED` -> `SCHEDULE_DRAFTING` -> `SCHEDULE_PENDING_APPROVAL` -> `SCHEDULE_REJECTED` -> `SCHEDULE_APPROVED` -> `IN_PROGRESS` -> `QA_REVIEW` -> `COMPLETED` -> (`ON_HOLD`, `ARCHIVED`)
- **TaskCard.status (보드 표시 상태)**:
  `TODO`, `READY`, `IN_PROGRESS`, `REVIEW`, `DONE`, `HOLD`, `REJECTED`
- **TaskCard.completionStatus (결재 흐름 상태)**:
  `NOT_STARTED`, `IN_PROGRESS`, `WORKER_DONE`, `PM_REVIEWING`, `PM_APPROVED`, `MANAGER_REVIEWING`, `MANAGER_APPROVED`, `COMPLETED`, `REOPENED`, `REJECTED`
- **ApprovalRequest.status (승인 요청 상태)**:
  `PENDING`, `PM_REVIEWING`, `PM_APPROVED`, `MANAGER_REVIEWING`, `APPROVED`, `REJECTED`, `CANCELLED`
- **ChangeRequest.status (변경 요청 상태)**:
  `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `APPLIED`, `CANCELLED`
- **PersonalSchedule.status (개인일정 상태)**:
  `SCHEDULED`, `CHANGED`, `CANCELLED`, `COMPLETED`

## Module: Settings
Manage generic project templates, roles, and UI preferences.
- **Preference**: User-specific dashboard layout preferences and Off/Day toggle settings.

---
## Module: Performance Evaluation (Plan 8)
Manage quality control, workload adjustments, and performance scores.

- **EvaluationPeriod**: Defines the timeframe for performance evaluation (e.g., Q1 2026).
- **EvaluationPolicy**: Configuration defining error rate bands, base area py (e.g., 50,000), and weightings for QC and workload.
- **EvaluationTarget**: Tracks which users are included in an evaluation period.
- **QcIssue**: Quality control error records associated with completed tasks, including stage, severity, and assigned weight (10%~100%).
- **ProjectEvaluationContext**: PM's summary notes on project difficulty, used purely as context for QC reviewers.
- **ProjectScaleFactor**: Weight calculated by dividing the project's gross area by the base area (50,000 py).
- **WorkloadUnit**: Calculated total volume of work performed by a user within a period, potentially scaled by `ProjectScaleFactor`.
- **PerformanceEvaluationResult**: The finalized scores, including `weightedErrorRate` and `qualityScore`.
- **EvaluationAppeal**: Records any formal appeals made by workers against their evaluation results.

## 6. Schedule Data Types
성격이 다른 일정 데이터를 분리하여 관리합니다.
- **Project schedule**: 프로젝트 전체 수행 기간 (start ~ end)
- **TaskCard schedule**: 카드 단위의 작업 할당 기한
- **ScheduleAssignment**: 베트남 스케줄표 Excel 등에서 파싱한 "일자별/직원별 배정 내역"
- **PersonalSchedule**: Off, 연차, 회의 등 개인의 업무 불가능 또는 특수 일정 (일반 Task와 분리 표시)

## 7. Permission Scope Rules
클라이언트 UI가 아닌 공통 함수(`src/lib/permissions.ts`)를 통해 접근을 제어합니다.
- **SUPER_ADMIN**: 모든 데이터 열람/조작 가능
- **MANAGER**: 본인이 소속된 부서 및 산하 작업자의 데이터 범위
- **PM**: 본인이 관리(PM 배정)하는 프로젝트와 소속 태스크 범위
- **WORKER**: 본인에게 직접 배정된 태스크와 자신의 인사/개인 일정
- **비활성 사용자/클라이언트**: 시스템 인가 전까지 접근 완전 차단

## 8. Audit / Snapshot / Progress / Notification Difference
모든 변경을 단일 테이블에 넣지 않고 목적별로 분할합니다.
- **AuditLog**: "누가/언제/무엇을" 바꿨는지 기록하는 시스템 감사 목적
- **VersionSnapshot**: 상태 변경 전/후의 원본 데이터를 복원 가능한 덩어리로 보관
- **ProgressUpdate**: 20% 이상 진척 등 작업 내용이 바뀔 때 사용자가 작성하는 "업무 일지"
- **Notification**: 즉시 사용자의 인지를 요하는 알람성 데이터

## 9. Derived Fields (Selectors)
진행률, 건강도 등 파생/요약 데이터는 UI에서 직접 계산하지 않고 Selector 함수를 통해 산출합니다.
- `getProjectProgress(projectId)`
- `getTaskProgress(taskId)`
- `getColumnSummary(columnId)`
- `getTaskHealthScore(taskId)`

## 10. Seed Data Strategy
MVP 단계의 테스트 데이터(Mock)와 베트남(VN) Excel Seed 데이터를 분리하지 않고 통합합니다. 모든 UI(보드, 대시보드, 공정표)는 정규화된 이 Seed 구조를 공통으로 바라봅니다.

## 11. Future DB Migration Notes
초기엔 파일/상태 기반이나, RDBMS 전환 시 `completionStatus`와 `status`의 무결성을 유지하는 Check Constraint, 일정 데이터간 외래 키 무결성 보장 방식 등을 반영해야 합니다.
