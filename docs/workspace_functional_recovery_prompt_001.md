# WORKSPACE FUNCTIONAL RECOVERY PROMPT 001 - Plan 17

## 목적

이 프롬프트는 `workspace plan1.txt`부터 `workspace plan16.txt`, `workspace_master_report_v2.md`, `integrated-workspace-report.md`, `qa-evidence-matrix.md`를 근거로 현재 Workspace 프로젝트의 **기능적 미반영/부분 구현 항목**을 복구하기 위한 Antigravity 작업 지시서다.

현재 별도 흐름에서 디자인 개선이 진행 중이므로, 본 Plan 17에서는 **디자인/레이아웃/시각 스타일 개선을 제외**한다.

Antigravity는 아래 원칙을 지켜야 한다.

1. 디자인 개선 중인 파일의 스타일 변경을 임의로 덮어쓰지 않는다.
2. 기능 연결에 꼭 필요한 최소 UI wiring은 허용하되, 색상/간격/카드 디자인/반응형 레이아웃 개선은 하지 않는다.
3. 문서상 완료 표현을 근거로 완료 처리하지 말고 실제 store, selector, route, action, validation, lint/build 결과를 확인한다.
4. 각 Phase 완료 후 반드시 사용자 승인 요청을 하고, 승인 전 다음 Phase로 넘어가지 않는다.
5. 원격 GitHub push는 사용자 승인 전까지 절대 하지 않는다.

---

## 현재 기준선

2026-07-08 기준 확인 결과:

- `npm.cmd run build`: PASS
- `npm.cmd run lint`: FAIL
  - 19 errors, 28 warnings
  - 주요 error: CommonJS `require()` lint 오류, `any` 사용, `jsonHandoff.ts` 타입 부재, `settings/personnel/page.tsx` any cast
- 현재 작업트리에는 디자인 개선 변경이 존재한다.
  - `src/app/globals.css`
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - dashboard/layout/sidebar/header 관련 파일들
  - Antigravity는 이 변경을 되돌리거나 시각 스타일을 재작성하지 않는다.

기능 검토 중 확인된 대표적인 불일치:

1. `DataSourceMode`는 존재하지만 JSON 운영 데이터가 앱 store에 실제로 로드/적용되지 않는다.
2. `applyImportData()`는 console/alert만 수행하며 Zustand store를 갱신하지 않는다.
3. `scripts/import-json-data.ts`는 `operationData.ts`를 생성하지만 앱 store가 이를 사용하지 않는다.
4. Import Preview 화면의 `Seed Data에 반영`은 세션 상태만 `APPLIED`로 바꾼다.
5. 인사카드 편집은 auth store의 user만 갱신하고 JSON/runtime/schedule 기준 데이터와 완전히 연결되지 않는다.
6. 권한 함수는 `role` 중심이며 `systemRole`, `employmentStatus`, 권한 flag, 대리 결재자 규칙이 일관되게 반영되지 않는다.
7. ApprovalRequest 승인 결과가 프로젝트/업무/일정/알림/AuditLog에 체계적으로 반영되지 않는다.
8. RevisionRequest 타입/JSON은 있으나 생성, 승인, 진행, 완료 workflow가 실제 store action으로 충분히 연결되지 않는다.
9. Data Quality 검사는 mock list이며 실제 store를 스캔하지 않는다.
10. AuditLog는 타입만 있고 통합 store/view/action 기록이 미완성이다.
11. Notification store는 존재하지만 주요 domain action에서 알림을 생성하지 않는다.
12. 성과평가는 계산 엔진은 있으나 workload가 mock이고 lock/appeal 결과가 실제 QC/평가 lifecycle과 완전히 연결되지 않는다.

---

## 전역 작업 규칙

각 Phase는 반드시 다음 순서로 진행한다.

```text
분석
-> 구현
-> 자체 검수
-> npm.cmd run lint
-> npm.cmd run build
-> 완료 보고
-> 사용자 승인 요청
```

완료 보고에는 반드시 다음을 포함한다.

```text
1. 수정한 파일
2. 구현/수정한 기능
3. 실제로 동작 확인한 시나리오
4. lint/build 결과
5. 남은 리스크
6. Git 상태
7. 다음 Phase 진행 승인 요청
```

금지사항:

- 디자인 전용 변경 금지
- CSS/레이아웃 대규모 변경 금지
- 기존 디자인 작업분 되돌리기 금지
- store 상태만 바꾸고 실제 기능 완료라고 보고 금지
- mock 데이터를 실사용 데이터처럼 설명 금지
- GitHub Pages에서 브라우저가 repo 파일을 직접 쓴다고 구현/표현 금지
- 사용자 승인 없이 다음 Phase 진행 금지
- 사용자 승인 없이 push 금지

---

# Phase 123 - 기능 불일치 정밀 분석 및 작업 범위 잠금

## 목표

Plan 1~16과 실제 코드 사이의 기능 불일치를 다시 확인하고, 디자인 영역을 제외한 기능 복구 범위를 확정한다.

## 작업

- `docs/workspace plan1.txt`부터 `docs/workspace plan16.txt`까지 읽는다.
- `docs/workspace_master_report_v2.md`, `docs/integrated-workspace-report.md`, `docs/qa-evidence-matrix.md`, `docs/test-matrix.md`, `docs/workspace-data-dictionary.md`를 읽는다.
- 실제 route/store/selector/type/script를 확인한다.
- 디자인 변경 파일은 별도 작업자가 수정 중인 것으로 보고, 기능 구현에 필요한 최소 변경만 계획한다.
- 기능별로 다음 상태를 분류한다.
  - 실제 완료
  - 타입/화면만 존재
  - mock/placeholder
  - 미구현
  - 검증 불가

## 완료 조건

- 기능 불일치 목록 작성
- Phase 124~136 중 실제 필요한 Phase 범위 확정
- 디자인 작업과 충돌 가능한 파일 목록 표시
- 사용자에게 Phase 124 진행 승인 요청

## 완료 보고 형식

```text
[Phase 123 완료 보고]

1. 검토한 문서
2. 실제 코드 확인 범위
3. 기능별 완료/부분구현/mock/미구현 분류
4. 디자인 작업과 충돌 가능한 파일
5. 확정한 Phase 범위
6. lint/build 기준선
7. Git 상태
8. 다음 단계: Phase 124 진행 승인 요청

Phase 124를 진행해도 될까요?
```

사용자가 승인하기 전까지 Phase 124를 시작하지 마라.

---

# Phase 124 - lint error 기준선 정리

## 목표

기능 복구 작업을 안정적으로 진행할 수 있도록 lint error를 0으로 만든다. 디자인 warning이나 스타일 리팩터링은 하지 않는다.

## 작업

- `npm.cmd run lint` 결과의 error만 우선 수정한다.
- scripts의 CommonJS `require()` 문제를 ESM import 또는 ESLint ignore 기준에 맞게 정리한다.
- `src/lib/jsonHandoff.ts`의 `any`를 구체 타입으로 교체한다.
- `src/app/settings/personnel/page.tsx`의 `any` cast를 안전한 union/type guard로 교체한다.
- 사용하지 않는 import warning은 기능 파일에서 쉽게 정리 가능한 것만 최소 수정한다.

## 완료 조건

- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS
- 기능 동작 변경 없이 타입 안정성만 개선

## 완료 보고 형식

```text
[Phase 124 완료 보고]

1. 수정한 lint error 목록
2. 수정한 파일
3. 남은 warning 수와 이유
4. lint 결과
5. build 결과
6. Git 상태
7. 다음 단계: Phase 125 진행 승인 요청

Phase 125를 진행해도 될까요?
```

---

# Phase 125 - Runtime DataSource와 store apply 실제 연결

## 목표

`DataSourceMode`가 화면 표시용 상태에 그치지 않고, 실제 store 데이터 로딩/교체/empty state 기준으로 동작하게 한다.

## 작업

- runtime data loader 설계
  - `JSON_OPERATION_DATA`
  - `EXCEL_IMPORT_DATA`
  - `DEMO_SEED_DATA`
  - `EMPTY`
- `src/data/operationData.ts`가 존재하면 JSON 운영 데이터로 읽는 경로를 연결한다.
- JSON 운영 데이터가 없으면 프로젝트/업무/인사/일정이 조용히 demo fallback되지 않고 empty state가 되게 한다.
- 각 store에 replace/reset action 추가
  - projects
  - tasks
  - personnel/users
  - schedules
  - settings
  - approvals
  - notifications
  - revisionRequests
  - postDeliveryWorkRequests
- `applyImportData()`가 실제 store를 갱신하도록 구현한다.
- store apply 전 validation 실패 시 반영을 차단한다.

## 완료 조건

- JSON import가 실제 화면 데이터에 반영된다.
- JSON 없음 상태에서 demo data가 자동 노출되지 않는다.
- 운영 검증 모드에서만 demo seed 주입이 가능하다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 125 완료 보고]

1. 구현한 DataSourceMode 동작
2. 추가한 store replace/reset action
3. JSON import apply 실제 반영 결과
4. demo fallback 차단 방식
5. 검증 시나리오
6. lint/build 결과
7. 다음 단계: Phase 126 진행 승인 요청

Phase 126을 진행해도 될까요?
```

---

# Phase 126 - JSON Handoff schema/validation/scripts 실사용화

## 목표

웹 export/import와 `/json` 폴더, Node scripts가 같은 schema를 사용하게 하며 Antigravity가 JSON을 읽어 코드 데이터로 반영할 수 있게 한다.

## 작업

- canonical `WorkspaceExportData` schema 정리
- export 대상에 다음을 포함한다.
  - projects
  - tasks
  - personnel
  - schedules
  - settings
  - approvals
  - notifications
  - postDeliveryWorkRequests
  - revisionRequests
  - dataQualityChecks 또는 scan 결과
- `validate-json-data.ts`가 얕은 배열 확인에 그치지 않고 cross-reference를 검사하게 한다.
  - projectId 참조
  - task.projectId 참조
  - assigneeId/userId 참조
  - managerId/pmId 참조
  - revision/post-delivery request projectId 참조
- `import-json-data.ts`가 `operationData.ts`를 생성하고, 앱 runtime loader가 이를 실제로 사용하게 한다.
- `export-current-state.ts`가 빈 scaffold만 만들지 않고 schema template과 manifest를 일관되게 생성하게 한다.
- `/json/README.md`를 실제 사용 절차 중심으로 정정한다.

## 완료 조건

- `npm.cmd run json:validate` PASS
- `npm.cmd run json:import` 후 앱에서 operationData를 사용할 수 있음
- 웹 export 파일을 validate script가 통과함
- schemaVersion 불일치 또는 참조 오류를 명확히 차단
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 126 완료 보고]

1. 확정한 JSON schema
2. validation 강화 내용
3. import/export script 동작 결과
4. /json README 정정 내용
5. 검증 명령 결과
6. lint/build 결과
7. 다음 단계: Phase 127 진행 승인 요청

Phase 127을 진행해도 될까요?
```

---

# Phase 127 - Excel Import Preview Apply 실제 반영

## 목표

Import Preview 화면의 `Seed Data에 반영`이 세션 상태 변경만 하지 않고 실제 runtime data/store에 반영되게 한다.

## 작업

- `src/store/importStore.ts`의 mock session/issue 의존도를 분리한다.
- Import session에 preview payload를 저장할 수 있는 구조를 만든다.
- blocker가 있으면 apply를 차단한다.
- warning만 있을 때는 사용자 확인 후 apply할 수 있게 한다.
- apply 성공 시 projects/tasks/personnel/schedules를 runtime store에 반영한다.
- apply 결과를 JSON export에도 포함한다.
- apply 전/후 summary를 남긴다.
- 실제 Excel parser와 연결이 부족하면 "적용 불가"로 명시하고 완료라고 보고하지 않는다.

## 완료 조건

- `Seed Data에 반영` 실행 시 실제 데이터가 바뀐다.
- blocker가 있으면 반영되지 않는다.
- apply 후 import session status가 `APPLIED`가 된다.
- apply 결과가 JSON export에 포함된다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 127 완료 보고]

1. Import Preview apply 구조
2. blocker/warning 처리 방식
3. 실제 store 반영 결과
4. JSON export 반영 결과
5. 검증 시나리오
6. lint/build 결과
7. 다음 단계: Phase 128 진행 승인 요청

Phase 128을 진행해도 될까요?
```

---

# Phase 128 - 인사카드/조직/권한 기준 데이터 정합성

## 목표

인사카드를 일정표, 권한, 결재의 기준 데이터로 실제 연결하고 `role`/`systemRole`/`organizationRank` 혼동을 정리한다.

## 작업

- `PersonnelCard` canonical field와 legacy compatibility 기준을 문서화한다.
- 권한 판정은 `systemRole ?? role` 기준으로 통일한다.
- `employmentStatus`, `isActive`가 비활성/퇴사자인 경우 접근과 일정 노출을 차단한다.
- `canViewTeamSchedule`, `canViewDepartmentSchedule`, `canViewAllSchedule`, `canApprove` 같은 flag가 있으면 권한 함수에 반영한다.
- `deputyApproverId` 로직을 approval page 내부가 아니라 공통 permission/service로 이동한다.
- `src/utils/permissions.ts`와 `src/lib/permissions.ts` 중복을 정리한다.
- 인사카드 변경이 직원 일정표의 행/권한 판단에 반영되는지 확인한다.
- 조직 JSON과 PersonnelCard의 company/department/subDepartment 참조를 validate한다.

## 완료 조건

- systemRole과 organizationRank가 분리되어 동작한다.
- inactive/resigned 직원은 접근/노출에서 제외된다.
- 대리 결재자 판정이 공통 함수로 동작한다.
- 일정표 visible user가 PersonnelCard 기준으로 계산된다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 128 완료 보고]

1. 정리한 PersonnelCard 기준
2. 권한 함수 변경 내용
3. 대리 결재자 처리 방식
4. 일정표 연결 검증
5. 조직 참조 validation 결과
6. lint/build 결과
7. 다음 단계: Phase 129 진행 승인 요청

Phase 129를 진행해도 될까요?
```

---

# Phase 129 - Approval workflow side effect와 Audit/Notification 연결

## 목표

ApprovalRequest 승인/반려가 status만 바꾸는 것이 아니라 실제 domain data, AuditLog, Notification에 반영되게 한다.

## 작업

- AuditLog store를 만든다.
- approval service 또는 store action을 정리한다.
- 승인 단계 전이를 명확히 한다.
  - PENDING
  - PM_REVIEWING 또는 PM_APPROVED
  - MANAGER_REVIEWING
  - APPROVED
  - REJECTED
  - CANCELLED
- 요청 유형별 side effect를 구현한다.
  - 일정 승인/반려
  - 야근/연장/인력지원 요청
  - 추가 업무 요청
  - PM 배정
  - 우선순위 변경
  - 일정 재계획
- 승인/반려/대안승인 시 알림을 생성한다.
- 모든 주요 승인 처리에 AuditLog를 남긴다.
- 승인 전 원본 데이터가 바뀌지 않는지 확인한다.

## 완료 조건

- 결재 승인이 관련 schedule/task/project에 실제 반영된다.
- 반려 시 원본 데이터가 유지된다.
- 알림과 AuditLog가 생성된다.
- 대리 결재자가 승인할 수 있다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 129 완료 보고]

1. 구현한 approval state transition
2. 요청 유형별 side effect
3. AuditLog 기록 방식
4. Notification 생성 방식
5. 승인 전 원본 보호 검증
6. lint/build 결과
7. 다음 단계: Phase 130 진행 승인 요청

Phase 130을 진행해도 될까요?
```

---

# Phase 130 - RevisionRequest와 PostDeliveryWorkRequest workflow 분리 완성

## 목표

클라이언트 수정 요청(`RevisionRequest`)과 내부 사후 추가 업무(`PostDeliveryWorkRequest`)를 실제 workflow에서 분리한다.

## 작업

- RevisionRequest canonical status를 Plan 15/16 기준으로 정리한다.
- JSON `revision-requests.json`을 runtime data에 로드한다.
- RevisionRequest 생성 action 추가
- RevisionRequest 승인/반려/진행/완료 action 추가
- 승인 시 프로젝트가 revision workflow로 분류되게 selector 연결
- 완료 시 프로젝트가 완료 workflow로 돌아가게 처리
- PostDeliveryWorkRequest는 내부 추가 업무/재오픈 흐름으로 유지한다.
- 둘 다 ApprovalRequest, AuditLog, Notification과 연결한다.

## 완료 조건

- RevisionRequest가 실제 생성/승인/진행/완료된다.
- RevisionRequest와 PostDeliveryWorkRequest가 데이터/상태/이력에서 섞이지 않는다.
- board selector가 active revision을 반영한다.
- JSON import/export에 revision/post-delivery request가 포함된다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 130 완료 보고]

1. RevisionRequest 구조
2. PostDeliveryWorkRequest와의 구분
3. 승인 workflow 연결
4. board selector 반영 결과
5. JSON import/export 반영
6. lint/build 결과
7. 다음 단계: Phase 131 진행 승인 요청

Phase 131을 진행해도 될까요?
```

---

# Phase 131 - Data Quality 실제 scanner 구현

## 목표

mock Data Quality list를 실제 store 기반 scanner로 교체한다.

## 작업

- `runChecks()`가 실제 projects/tasks/users/schedules/approvals/revision/post-delivery data를 스캔하게 한다.
- 최소 검사 항목:
  - PM 미배정 프로젝트
  - assigneeId가 존재하지 않는 task
  - inactive/resigned 직원에게 배정된 task/schedule
  - task.projectId가 없는 고아 task
  - schedule.userId가 없는 고아 schedule
  - blocker가 있는 import apply
  - 완료 프로젝트의 미결 post-delivery/revision request
  - 납품일/목표일 없는 active project
  - permission scope 위반 가능성
  - JSON schema/reference 오류
- 해결/무시 처리 결과는 재검사 후에도 추적 가능하게 한다.

## 완료 조건

- `전체 데이터 재검사`가 실제 결과를 생성한다.
- mock 고정 목록이 기본값으로 남지 않는다.
- scanner 결과가 Data Quality page에 표시된다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 131 완료 보고]

1. 구현한 scanner 목록
2. 실제 감지된 issue 예시
3. resolve/ignore 유지 방식
4. JSON validation 연동 여부
5. lint/build 결과
6. 다음 단계: Phase 132 진행 승인 요청

Phase 132를 진행해도 될까요?
```

---

# Phase 132 - 성과평가/이의신청 실제 데이터 연결

## 목표

성과평가가 mock workload에 의존하지 않고 실제 task/schedule/QC issue를 기반으로 계산되게 하고, lock/appeal workflow를 강화한다.

## 작업

- workloadUnits를 실제 task, schedule, project source data에서 생성한다.
- 0 작업량인 직원의 zero division 방어를 유지한다.
- 평가 lock 상태를 store에 저장한다.
- lock 후에는 일반 사용자의 QC issue 신규 등록/수정이 차단되게 한다.
- EvaluationAppeal 수용 시 QC issue weight/status가 실제 반영되고 AuditLog/Notification을 남긴다.
- EvaluationAppeal 반려 시 사유와 이력이 남는다.
- 평가 당시 PersonnelCard snapshot 보존 필요 여부를 검토하고 최소 구현한다.

## 완료 조건

- mockWorkloads 의존이 제거되거나 운영 검증 전용으로 격리된다.
- 평가 결과가 실제 업무/QC 데이터로 계산된다.
- lock/appeal workflow가 실제로 동작한다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 132 완료 보고]

1. 실제 workload 산출 기준
2. zero division 검증 결과
3. lock 처리 방식
4. appeal 수용/반려 side effect
5. AuditLog/Notification 연동
6. lint/build 결과
7. 다음 단계: Phase 133 진행 승인 요청

Phase 133을 진행해도 될까요?
```

---

# Phase 133 - Notification 기능 고도화와 domain event 연결

## 목표

알림이 mock list가 아니라 실제 domain event의 결과로 생성되고, 요약/긴급 알림이 동작하게 한다.

## 작업

- Notification 생성 지점을 domain action에 연결한다.
  - approval requested/approved/rejected
  - schedule conflict detected/resolved
  - import apply blocked/applied
  - revision requested/approved/completed
  - post-delivery requested/approved/reopened
  - evaluation appeal submitted/reviewed
- 기존 `groupId/count` 로직을 활용하여 digest/group notification을 구현한다.
- priority가 `CRITICAL`인 알림은 group 처리 여부와 별도로 식별 가능하게 한다.
- 외부 이메일/메신저 연동은 실제 구현하지 말고 placeholder status로 명확히 표시한다.
- Notification export/import에 포함한다.

## 완료 조건

- 주요 workflow에서 알림이 자동 생성된다.
- 같은 groupId 알림이 묶인다.
- 긴급 알림이 구분된다.
- 알림이 JSON export/import에 포함된다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 133 완료 보고]

1. 알림 생성 event 목록
2. digest/group 처리 방식
3. 긴급 알림 처리 방식
4. 외부 연동 placeholder 범위
5. JSON 반영 결과
6. lint/build 결과
7. 다음 단계: Phase 134 진행 승인 요청

Phase 134를 진행해도 될까요?
```

---

# Phase 134 - 세션/첨부파일 기능 안정화

## 목표

마스터 리포트의 잔여 항목인 세션 보안 타이머와 파일 첨부 기능을 기능적으로 안정화한다. 디자인 개선은 하지 않는다.

## 작업

- SessionManager가 실제 app root에 연결되어 있는지 확인한다.
- inactivity timeout 후 logout/lock이 실제로 동작하는지 검증한다.
- 설정값 `SESSION_TIMEOUT_MINUTES` 변경이 즉시 반영되는지 확인한다.
- Task artifact 첨부가 object URL만 저장하는 현재 한계를 명확히 하고, JSON export/import 가능한 metadata 구조로 정리한다.
- 파일 용량/확장자 validation을 공통 함수로 분리한다.
- GitHub Pages/정적 웹에서는 실제 파일 바이너리 저장이 불가능함을 안내한다.
- 파일 metadata export/import가 가능하게 한다.

## 완료 조건

- 세션 timeout이 실제로 작동한다.
- 첨부파일 validation이 일관되게 적용된다.
- 첨부 metadata가 JSON export/import에 포함된다.
- 실제 파일 스토리지 미연동 한계가 명확히 표시된다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS

## 완료 보고 형식

```text
[Phase 134 완료 보고]

1. SessionManager 연결/검증 결과
2. timeout/lock/logout 동작
3. 첨부파일 validation 구조
4. 첨부 metadata JSON 처리
5. 정적 웹 한계 안내
6. lint/build 결과
7. 다음 단계: Phase 135 진행 승인 요청

Phase 135를 진행해도 될까요?
```

---

# Phase 135 - GitHub Pages routing 및 운영 검증

## 목표

정적 export 환경에서 기본 route와 하위 route 접근이 운영상 사용 가능한지 검증한다.

## 작업

- `next.config.ts`의 `output: "export"`와 `basePath` 확인
- GitHub Pages 배포 환경에서 필요한 `.nojekyll`/404 fallback 방식 확인
- local `out/` 산출물 기준으로 하위 route 파일이 생성되는지 확인
- 존재하지 않는 route의 사용자 복귀 흐름 확인
- 이 작업은 라우팅 기능 검증이며, 디자인 수정은 하지 않는다.

## 완료 조건

- `npm.cmd run build` PASS
- `out/` 산출물 route 구조 확인
- GitHub Pages 하위 route refresh 리스크가 해결되거나, 미해결이면 docs에 정확히 WARNING 표기
- `qa-evidence-matrix.md`에 결과 반영

## 완료 보고 형식

```text
[Phase 135 완료 보고]

1. next export 설정 확인
2. out route 산출물 확인
3. 하위 route refresh 대응 방식
4. 남은 GitHub Pages 리스크
5. QA Evidence Matrix 반영
6. lint/build 결과
7. 다음 단계: Phase 136 진행 승인 요청

Phase 136을 진행해도 될까요?
```

---

# Phase 136 - 기능 QA 증빙 및 리포트 정정

## 목표

Plan 17 기능 복구 결과를 실제 검증 증빙과 문서에 반영한다.

## 작업

- `qa-evidence-matrix.md`의 PENDING 항목을 실제 검증 결과로 업데이트한다.
- `test-matrix.md`에 필요한 시나리오를 보강한다.
- `workspace_master_report_v2.md`의 완료 표현을 실제 결과에 맞게 정정한다.
- 미구현/제약/추후 DB 필요 항목을 과장 없이 남긴다.
- 최종 lint/build 결과를 기록한다.
- 사용자 승인 전 push하지 않는다.

## 완료 조건

- QA Evidence Matrix가 실제 PASS/FAIL/WARNING/SKIP 결과를 가진다.
- 마스터 리포트가 실제 구현과 일치한다.
- 남은 리스크가 명확히 정리된다.
- `npm.cmd run lint` error 0
- `npm.cmd run build` PASS
- GitHub push 승인 요청으로 마무리한다.

## 완료 보고 형식

```text
[Phase 136 완료 보고]

1. Plan 17 기능 복구 요약
2. JSON/runtime data 검증 결과
3. Import apply 검증 결과
4. 인사/조직/권한 검증 결과
5. approval/revision/post-delivery 검증 결과
6. audit/notification 검증 결과
7. data quality/evaluation/session/attachment 검증 결과
8. GitHub Pages routing 검증 결과
9. QA Matrix / Master Report 정정 결과
10. lint/build 결과
11. 남은 리스크
12. Git 상태
13. GitHub push 승인 요청

원격 저장소에 push를 진행해도 될까요?
```

사용자가 승인하기 전까지 push하지 마라.

---

## Antigravity 시작 프롬프트

아래 내용을 Antigravity에게 그대로 전달한다.

```text
현재 F:\workspace 프로젝트의 기능 복구 작업을 진행한다.

반드시 docs/workspace_functional_recovery_prompt_001.md를 먼저 읽고, Plan 17 / Phase 123부터 시작하라.

중요:
- 현재 별도 흐름에서 디자인 개선이 진행 중이다.
- 디자인/레이아웃/색상/간격/카드 스타일/반응형 개선은 하지 마라.
- 기능 연결에 필요한 최소 UI wiring만 허용한다.
- 기존 디자인 작업분을 되돌리거나 덮어쓰지 마라.
- 문서상 완료 표현만 믿지 말고 실제 code/store/selector/route/script 동작으로 판단하라.
- 각 Phase 완료 후 사용자 승인을 요청하고, 승인 전 다음 Phase로 넘어가지 마라.
- 원격 GitHub push는 사용자 승인 전까지 절대 하지 마라.

지금은 Phase 123만 진행하라.

Phase 123에서는 다음을 보고하라.
1. 검토한 문서
2. 실제 코드 확인 범위
3. 기능별 완료/부분구현/mock/미구현 분류
4. 디자인 작업과 충돌 가능한 파일
5. 확정한 Phase 범위
6. lint/build 기준선
7. Git 상태
8. 다음 단계: Phase 124 진행 승인 요청

Phase 124를 진행해도 될까요?
```
