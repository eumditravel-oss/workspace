# Workspace 프로젝트 통합 리포트 (보강본)

본 문서는 Plan 1 ~ 8의 요구사항이 반영된 Workspace 시스템의 최종 현황을 정리한 통합 리포트입니다. 기능의 과장 없이 현재 검증된 사항(MVP)과 추후 확장할 사항을 명확히 구분하여 작성되었습니다.

---

## 1. MVP 및 확장 범위 구분

### MVP 구현 완료 범위
- 사용자 / 부서 / 프로젝트 / 업무 카드 기본 구조
- 역할별 대시보드 (SUPER_ADMIN, DEPARTMENT_MANAGER, PM, WORKER)
- 수주 프로젝트 등록 및 PM 배정
- 일정 작성 및 승인/반려 프로세스 (결재 시스템)
- 카드형 업무 보드 (상태별, 담당자별, 우선순위별 View)
- 작업 진행률 업데이트 (20% 단위 수정 강제, 사유 기재)
- 기본 알림 및 단순 AuditLog 내역 표출
- 직원별 공정표 (오프/휴무 연동)
- 권한별 데이터 노출 제한 기능

### 설계 반영 / 추후 구현 범위
- **실제 클라이언트 포털**: 현재 UI/UX 구조로만 설계되었으며 실제 외부 고객 로그인 포털은 미구현
- **실제 파일 스토리지 업로드**: 첨부파일 컴포넌트는 있으나 S3 등 스토리지 연동 필요
- **ERP / 그룹웨어 연동**: 향후 API 설계에 맞춰 개발 예정
- **실제 DB 전환**: 현재는 로컬 상태 및 Mock 데이터를 활용, Supabase 등으로 전환 필요
- **외부 메일/메신저 알림 연동**: 내부 Notification 시스템만 존재하며 사내 메신저 연동 미구현
- **고급 평가 리포트 Export**: PDF/Excel 등 추출 기능은 향후 기능
- **AI 자동 일정 배정**: 현재는 매뉴얼 할당 방식을 사용 중

---

## 2. 데이터 저장 방식 및 운영 전환 계획

- **현재 데이터 방식**: Zustand 기반의 Local State 관리, Seed 데이터를 활용한 Mock 데이터 환경
- **실제 DB 적용 필요 여부**: 실운영 환경을 위해서는 영구 저장 DB 도입이 필수
- **인증 방식**: Mock User 로그인(역할 선택형) 채택, 향후 JWT/OAuth 기반 연동 필요
- **권한 적용 위치**: 클라이언트 사이드(UI 노출 제한 및 Store Action Guard)에서 적용. 향후 서버 사이드 RLS(Row Level Security) 적용 요망
- **DB 후보**: PostgreSQL 기반 Supabase 등
- **백업 및 복구 계획**: 추후 DB 인프라 레벨의 자동 백업 스냅샷 구축 예정

---

## 3. 검색 및 필터 체계

- **글로벌 검색 대상**: 사용자의 역할 내에서 접근 가능한 업무 카드 제목, 담당자명, 부서명
- **고급 필터 항목**: `Status`, `Assignee`, `Priority` 조합형 필터 제공
- **SavedView 지원 여부**: 현재 브라우저 메모리에 의존하며 영구 저장 뷰(SavedView)는 확장 목표
- **역할별 기본 뷰**: PM은 담당 프로젝트 우선, 일반 작업자는 '내 작업' 우선 렌더링
- **권한 없는 검색 결과 차단 방식**: 클라이언트 렌더링 전 필터 로직(`accessibleProjects`, `filter`) 적용

---

## 4. VN 월별 스케줄표 데이터화 (Plan 5)

- **검증 시트**: `베트남 월별 스케줄표_종합.xlsx` 구조 분석 완료
- **Project List 활용 방식**: 엑셀의 프로젝트-단지 조합을 `ProjectScope` 개념으로 추상화
- **일정 데이터 맵핑**: 시트의 행(Project/Scope)과 열(Day) 조합을 기반으로 `ScheduleAssignment` 및 `TaskCard` 형태로 자동 전환하는 Seed 로직 설계 검증
- **오프 처리**: Off/Day/HALF Day 등을 `availability` 및 `scheduleType` 모델에 분리 반영 완료

---

## 5. 데이터 사전 및 상태값 표준화

- **Data Dictionary 위치**: `docs/workspace-data-dictionary.md`
- **Core MVP Entities**: `User`, `Project`, `TaskCard`
- **Project Status**: `PLANNING`, `IN_PROGRESS`, `ON_HOLD`, `COMPLETED` 등
- **TaskCard Status**: `TODO`, `IN_PROGRESS`, `BLOCKED`, `REVIEW`, `DONE`
- **ApprovalRequest Status**: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- **Evaluation Status**: `DRAFT`, `REPORTED`, `CONFIRMED`, `VOID`, `REJECTED`

---

## 6. 운영 예외처리

- **부재중 사용자 배정 경고**: 휴무일(`Off/Day`)로 지정된 작업자에게 업무 할당 시 UI상 충돌 가능성을 확인할 수 있는 스케줄 보드 제공
- **대리 승인자 지정**: 현재 결재 위임 아키텍처(Delegation) 모델 설계가 반영됨
- **비활성 직원 관리**: `status: INACTIVE` 필드를 통해 조회 시 제외 처리 가능 구조
- **PM 부재 시**: 결재 요청은 상위 부서장(`DEPARTMENT_MANAGER`)으로 Fallback되도록 설계

---

## 7. 변경요청 및 변경 이력

- **Change Request 유형**: 진행률 변경, 마감일 변경, 담당자 변경 (특히 20% 이상 진척도 변경 시 강제 모달 팝업)
- **승인 전 변경 미반영 원칙**: 중요 항목 변경(권한 요청 등)은 승인이 떨어질 때까지 스토어의 원본 데이터를 보호함
- **AuditLog 연동**: 변경 행위 발생 시 `Action`, `User`, `Timestamp`가 기록되어 이력 추적(History 뷰) 지원

---

## 8. 데이터 보존 및 백업 정책

- **Soft Delete 적용**: 카드를 완전히 지우지 않고 `deletedAt` 필드를 갱신하여 데이터 무결성 보존 (Archive 처리)
- **복구 권한**: 최고관리자(SUPER_ADMIN) 전용 기능으로 설계
- **배포/마이그레이션 백업**: 실 DB가 도입되면 마이그레이션 스크립트 실행 전 스냅샷 확보 필수 지정

---

## 9. 성과평가 통합 기능 (Plan 8)

- **작업량 및 규모 가중치**: 50,000Py 기준 보정 로직 구현 (면적 기반 계산 엔진)
- **QC 오류 검증 및 가중치**: 오류별 중요도(10~100%) 부여 및 모달 내 등록 완료
- **0 나누기 방어**: 작업량 0인 사용자의 오류율이 NaN으로 처리되지 않도록 엔진 내 방어 로직 완비
- **평가 Lock 및 보호**: 최고 관리자 권한을 통해 분기별 평가 마감 후 점수를 고정(Lock)하는 보안 체계 마련 (현황 페이지 반영)

---

## 10. QA 및 배포 검증

현재 Workspace 프로젝트는 1차 배포 전 주요 환경 검증을 수행하였으며 결과는 다음과 같습니다.

### 10-1. 정적 분석 및 빌드 (Static Analysis & Build)
- **Lint 결과**: **실패 (FAIL)**
  - 13건의 에러, 14건의 경고 발생 (`react-hooks/rules-of-hooks` 등)
  - **결론**: 즉시 서비스 구동은 가능하나, 장기적인 코드 품질을 위해 별도의 리팩터링 Phase를 통한 단계적 타입/Hook 수정이 필요합니다.
- **Build 결과**: **성공 (PASS)**
  - 8.6초 만에 `next build` 무결성 검증을 통과하여 정적 파일 추출(Export)에 문제 없음이 증명되었습니다.
- **Test 스크립트**: **스크립트 없음 (SKIP)**
  - 단위 테스트용 프레임워크가 아직 도입되지 않았습니다.

### 10-2. 배포 및 라우팅 (Deployment & Routing)
- **GitHub Pages 매핑**: **성공 (PASS)**
  - `next.config.ts`의 `basePath: "/workspace"` 및 `output: "export"` 설정이 정상 반영됨.
- **라우팅 리스크 (404)**: **리스크 존재 (WARNING)**
  - App Router 구조와 정적 Export의 조합 특성상, GitHub Pages 환경에서 하위 경로 새로고침 시 404를 반환할 수 있습니다. 
  - **결론**: 배포 시 `.nojekyll` 설정 확인 및 404 커스텀 라우팅 처리가 추가로 필요합니다.
- **모바일 뷰포트**: **일부 미흡 (WARNING)**
  - PC 모니터 최적화(Grid/Table 중심)로 구축된 현황이며, 모바일 반응형 UI 지원은 추후 확장 목표입니다.

> [!WARNING]
> 본 리포트의 모든 개발 범위는 구현이 완료되어 `origin/main` (Commit: `dbd73ba`) 에 동기화되었으나, Lint 오류와 GitHub Pages 특수 라우팅 대응 등 잔존 리스크를 제거하기 전까지는 실 서비스 환경(프로덕션) 투입에 있어 제한적인 테스트 운영을 권장합니다.
