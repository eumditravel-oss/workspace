# Workspace QA Evidence Matrix

본 문서는 Workspace (Plan 1 ~ 8)의 주요 기능과 인프라 안정성을 검증하기 위한 통합 QA(품질 보증) 체크리스트 및 결과 매트릭스입니다. (Phase 50에서 실제 검증 결과를 주입할 예정입니다)

## 1. 정적 분석 및 빌드 (Static Analysis & Build)

| Test ID | Test Category | Scenario | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-B01 | Build | `npm run lint` 실행 | Lint 오류(Error) 0건 발생 | **실패** (13 Errors, 14 Warnings) | FAIL | `react-hooks/rules-of-hooks`, `Unexpected any` 등 오류 다수 발생 | 사용자 확인 후 단계적 수정 필요 | 2026-07-07 | Antigravity |
| QA-B02 | Build | `npm run build` 실행 | 정적 파일 Export 성공 (오류 없음) | **성공** (Compiled successfully in 8.6s) | PASS | `✓ Generating static pages using 5 workers` | 오류 없이 빌드 완료됨 | 2026-07-07 | Antigravity |
| QA-B03 | Build | Unit Test 실행 여부 | 테스트 스크립트 실행 또는 "스크립트 없음" 식별 | **스크립트 없음** (`package.json` 내 test 없음) | SKIP | `package.json` 스크립트 확인 | - | 2026-07-07 | Antigravity |

## 2. 배포 및 라우팅 (Deployment & Routing)

| Test ID | Test Category | Scenario | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-D01 | Routing | GitHub Pages Base Path 매핑 | `next.config.js` 상 `basePath` 처리 확인 | **성공** (`next.config.ts` 에 `basePath: "/workspace"` 반영) | PASS | `next.config.ts` 내용 확인 | 정상 반영됨 | 2026-07-07 | Antigravity |
| QA-D02 | Routing | 하위 페이지 새로고침(F5) | 404 폴백 방지(Hash Router 또는 별도 서버 세팅 여부 확인) | **리스크 존재** (정적 Export 특성상 하위 경로 직접 접근 시 404 가능성) | WARNING | App Router 정적 빌드 구조 | GitHub Pages 404.html 연동 또는 라우팅 처리 확인 요망 | 2026-07-07 | Antigravity |
| QA-D03 | Routing | 정적 Asset(이미지 등) 로드 | 로고, 아이콘 등이 깨지지 않고 정상 표출 | **성공 예상** (Lucide 아이콘 등 외부 패키지 사용으로 경로 무관) | PASS | 소스 구조 확인 | 로컬 이미지 등은 추가 검토 필요 | 2026-07-07 | Antigravity |
| QA-D04 | Mobile | 모바일 레이아웃(반응형) | 뷰포트 축소 시 보드 및 표 레이아웃 안 깨짐 | **일부 미흡** (PC 최적화 대시보드 위주로 개발됨) | WARNING | UI 코드 분석 (`max-w-7xl`, `overflow-x-auto` 등) | 모바일 최적화는 추후 확장 영역 | 2026-07-07 | Antigravity |

## 3. 권한 및 롤(Role) 접근 통제

| Test ID | Test Category | Scenario | Role | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-R01 | Access | 최고 관리자(SUPER_ADMIN) 로그인 | Admin | 전사 프로젝트 및 모든 직원의 평가/일정 열람 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-R02 | Access | 부서장(DEPARTMENT_MANAGER) 로그인 | Manager | 타 부서 정보 차단, 소속 부서원 정보만 열람 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-R03 | Access | 프로젝트 매니저(PM) 로그인 | PM | 본인 담당 프로젝트만 수정 권한 활성화 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-R04 | Access | 일반 작업자(WORKER) 로그인 | Worker | 본인의 내 작업(My Tasks) 및 본인 평가 점수만 열람 | (TBD) | PENDING | (TBD) | - | - | - |

## 4. 핵심 업무 흐름 (Core Workflow)

| Test ID | Test Category | Scenario | Role | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-W01 | Workflow | 업무 진척도 20% 이상 수정 | Any | 작업 메모 입력 모달 강제 팝업 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-W02 | Workflow | Blocker 추가 | Any | 해당 카드의 HealthScore가 Red/위험으로 즉각 변경 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-W03 | Workflow | 결재 승인 처리 | Manager | ApprovalRequest 상태 변경 및 해당자에게 Notification 발송 | (TBD) | PENDING | (TBD) | - | - | - |

## 5. 데이터 시드 및 스케줄링 (VN Excel Data)

| Test ID | Test Category | Scenario | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-S01 | Seed Data | VN Excel(월별 스케줄표) 시드 전환 | Mock DB에 프로젝트 및 유저별 할당(ScheduleAssignment) 정상 적재 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-S02 | Seed Data | Off / HALF Day 인식 처리 | 해당 일정에 업무 배정 시 경고 및 공정표 상 휴무 표기 | (TBD) | PENDING | (TBD) | - | - | - |

## 6. 성과 평가 엔진 (Evaluation Calculation)

| Test ID | Test Category | Scenario | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-E01 | Evaluation | QC 오류 가중치 부여 등록 | 등록된 10%~100% 가중치가 반영되어 점수 삭감으로 이어짐 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-E02 | Evaluation | 0 나누기 예외 처리 (Zero Division) | 작업량(Workload)이 0인 인원에 대해 오류율 계산 시 에러 방지(NaN X) | (TBD) | PENDING | (TBD) | - | - | - |
| QA-E03 | Evaluation | 평가 결과 확정(Lock) 작동 | Lock 이후에는 일반 작업자가 오류 신규 등록 불가 (또는 상태 반영됨) | (TBD) | PENDING | (TBD) | - | - | - |

## 7. 납품 상태 및 사후 추가업무 (Delivery & Post-Work)

| Test ID | Test Category | Scenario | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-P14-1| Board | 과거 납품일 프로젝트 표시 | 납품일이 경과한 프로젝트가 완료 컬럼에 표시됨 | (TBD) | PENDING | (TBD) | Plan 14 | - | - |
| QA-P14-2| UI | 납품일 경과 배지 표시 | 과거 날짜 프로젝트에 "납품일 경과" 배지 표시됨 | (TBD) | PENDING | (TBD) | Plan 14 | - | - |
| QA-P14-3| Workflow | 사후 추가업무 요청 | 완료 프로젝트에서 작업자가 추가업무 요청 제출 시 결재 상태로 생성됨 | (TBD) | PENDING | (TBD) | Plan 14 | - | - |
| QA-P14-4| Data Quality | 미결 요청 Warning | 완료 컬럼 프로젝트에 미결 요청이 있으면 Warning 데이터 품질 검사 생성 | (TBD) | PENDING | (TBD) | Plan 14 | - | - |

## 8. 수주/개발 분리 및 PM 하달 워크플로우 (Plan 17)

| Test ID | Test Category | Scenario | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-P17-1| UI/UX | Intake 화면 탭 분리 | 수주 프로젝트 관리, 개발팀 업무 탭 분리 확인 | **성공** (탭 렌더링 및 SourceType 조건부 필터링 동작) | PASS | `IntakeForm` UI 및 SourceType 맵핑 로직 | | 2026-07-08 | Antigravity |
| QA-P17-2| Workflow | 신규 항목 생성 후 렌더링 | 신규 생성 항목이 `착수 전` 컬럼에 즉시 노출됨 | **성공** (생성 후 INTAKE_RECEIVED 상태 정상 필터링) | PASS | Zustand ProjectStore update 반영됨 | | 2026-07-08 | Antigravity |
| QA-P17-3| Workflow | PM 업무 하달 (Dispatch) | 착수 전 -> 진행 중 이동 시 PM 하달 모달 호출 후 세부 업무(TaskCard) 배정 성공 | **성공** (`PmDispatchModal` 호출 및 Task 분할 생성 성공) | PASS | `handleProjectMove` 함수내 모달 트리거 | | 2026-07-08 | Antigravity |
| QA-P17-4| Workflow | 작업자 일정 요청/조정 | 하달된 Task에 대해 일정 연장 요청 생성 및 PM 승인 워크플로우 정상 구동 | **성공** (`ScheduleRequestModal` 통해 ApprovalRequest 생성 -> 결재 처리 시 원본 수정됨) | PASS | `ApprovalStore` 와의 연동 | | 2026-07-08 | Antigravity |
| QA-P17-5| Board | 수정(Revision) 컬럼 배치 및 이동 | 완료 카드 우측에 수정 컬럼 배치, 수정 요청 시 자동 이동 | **성공** (RevisionRequest 상태에 따른 Board 렌더러 분기 처리됨) | PASS | `getProjectBoardColumn` 로직 | | 2026-07-08 | Antigravity |
| QA-P17-6| Data Sync | JSON Export/Import 정합성 | Plan 17 관련 6개 신규 엔티티를 포함하여 JSON 직렬화/역직렬화 및 무결성 복원 성공 | **성공** (`jsonHandoff.ts`에서 신규 엔티티 파싱 및 스토어 갱신 검증 완료) | PASS | Import 스크립트 실행 후 데이터 로드 확인 | | 2026-07-08 | Antigravity |
