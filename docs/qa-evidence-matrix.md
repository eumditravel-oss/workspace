# Workspace QA Evidence Matrix

본 문서는 Workspace (Plan 1 ~ 8)의 주요 기능과 인프라 안정성을 검증하기 위한 통합 QA(품질 보증) 체크리스트 및 결과 매트릭스입니다. (Phase 50에서 실제 검증 결과를 주입할 예정입니다)

## 1. 정적 분석 및 빌드 (Static Analysis & Build)

| Test ID | Test Category | Scenario | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-B01 | Build | `npm run lint` 실행 | Lint 오류(Error) 0건 발생 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-B02 | Build | `npm run build` 실행 | 정적 파일 Export 성공 (오류 없음) | (TBD) | PENDING | (TBD) | - | - | - |
| QA-B03 | Build | Unit Test 실행 여부 | 테스트 스크립트 실행 또는 "스크립트 없음" 식별 | (TBD) | PENDING | (TBD) | - | - | - |

## 2. 배포 및 라우팅 (Deployment & Routing)

| Test ID | Test Category | Scenario | Expected Result | Actual Result | Status | Evidence | Notes | Verified At | Verified By |
|---------|---------------|----------|-----------------|---------------|--------|----------|-------|-------------|-------------|
| QA-D01 | Routing | GitHub Pages Base Path 매핑 | `next.config.js` 상 `basePath` 처리 확인 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-D02 | Routing | 하위 페이지 새로고침(F5) | 404 폴백 방지(Hash Router 또는 별도 서버 세팅 여부 확인) | (TBD) | PENDING | (TBD) | - | - | - |
| QA-D03 | Routing | 정적 Asset(이미지 등) 로드 | 로고, 아이콘 등이 깨지지 않고 정상 표출 | (TBD) | PENDING | (TBD) | - | - | - |
| QA-D04 | Mobile | 모바일 레이아웃(반응형) | 뷰포트 축소 시 보드 및 표 레이아웃 안 깨짐 | (TBD) | PENDING | (TBD) | - | - | - |

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
