# Workspace 마스터 리포트 V2 (Plan 1 ~ 15 종합)

본 문서는 Plan 1부터 Plan 15까지 진행된 모든 기획 및 구현 내역을 하나로 통합한 **마스터 리포트**입니다. 초기 MVP 아키텍처부터 실운영 대비용 JSON 런타임 데이터 전환(Phase 104)에 이르기까지 방대한 구조화 작업이 완료되었습니다.

---

## 1. 기반 아키텍처 및 코어 시스템
- **스택**: Next.js 14+ App Router, Tailwind CSS, Zustand (로컬 상태 관리)
- **Role/조직**: SUPER_ADMIN, DEPARTMENT_MANAGER, PM, WORKER 권한 분리. CON-COST 및 Viet_QS(하위 파트 포함) 조직 구조 반영.
- **인사카드(Personnel Card)**: 시스템 권한(systemRole)과 직급(organizationRank) 분리. 고용 상태(Active/Inactive) 관리 및 일정표 기준 데이터 연동.

## 2. 결재 체계 및 파이프라인
- **결재 라우팅**: PENDING → PM_REVIEWING → MANAGER_REVIEWING → APPROVED 순차 승인.
- **방어 로직**: 승인 전 원본 데이터 변조 방지, 이력 추적(AuditLog) 기록.

## 3. 프로젝트 및 보드 운영
- **Project Source Type**: 외부 수주(`CLIENT_ORDER`)와 내부 개발(`INTERNAL_DEVELOPMENT`) 프로젝트 분리.
- **보드 4단 컬럼**: 작업 착수 전(PRE_WORK) → 진행 중(IN_PROGRESS) → 수정(REVISION) → 완료(COMPLETED).
- **납품일 임박도 현황**: Grid 레이아웃 적용 및 반응형 가로 스크롤 이슈 최적화.
- **사후 추가/수정 업무**: 클라이언트 요청(`RevisionRequest`)과 내부 판단(`PostDeliveryWorkRequest`) 분리 및 Reopen 로직.
- **월별 대시보드 요약**: 조회 월 선택(Dropdown)을 통한 권한별(PM, DeptManager 등) 대시보드 프로젝트/태스크 교차 필터링.

## 4. 성과 평가 및 검수(QC)
- **면적 기반 공수 보정**: 50,000평 기준 보정 계수 적용.
- **가중치 페널티**: QC 검수 시 발견된 결함에 대한 페널티 부과 및 Zero Division 오류 방지 로직.

## 5. 관리자 설정 및 데이터 Handoff
- **데이터 품질 검사**: 오류 데이터(유령 프로젝트, 납품일-배지 불일치 등) 식별 모듈.
- **권한 시뮬레이션**: 관리자가 특정 직원 뷰포인트로 빙의하여 권한 체크.
- **JSON Handoff (운영 대비)**: 방대한 더미데이터를 기본 비활성화. `workspace-export.json`, `personnel-cards.json` 등 JSON 수동 내보내기/불러오기를 통한 정적 웹 호스팅(GitHub Pages) 운영 대비.

---

## 6. 미구현(보강 대상) 항목 도출

Plan 1~15 스펙 중, 아직 UI 단에서 Mock 수준이거나 미구현된 **주요 잔여 항목**은 다음과 같습니다. 이 항목들은 Phase 105 이후의 로드맵으로 편성됩니다.

1. **알림(Notification) 고도화**
   - 현재 알림 아이콘/페이지는 존재하나, 피로도 감소를 위한 '요약 알림(묶음 알림)', 긴급 알림, 이메일/외부 시스템 연동 Placeholder 등이 미흡함.
2. **세션/보안 타이머(Session Management)**
   - 장기 미접속 시 자동 로그아웃(세션 만료) 처리, 보안 화면 잠금 로직 부재.
3. **고급 파일 첨부(File Attachment)**
   - 업무(TaskCard) 내 산출물 첨부 UI/UX. Drag & Drop 인터페이스 및 용량 제한, 포맷 검사 등 껍데기가 아닌 실제 파일 업로드 시뮬레이션 기능.
4. **대리 승인자(Deputy Approver) 지정**
   - PM 또는 부서장이 부재/휴가 중일 때 타인에게 승인 권한을 위임하는 설정 페이지/로직.
5. **이의신청(Appeal) 워크플로우**
   - 성과 평가(QC 오류 및 가중치) 결과에 대해 작업자가 이의를 제기하고 중간관리자가 재검토하는 흐름.
6. **Excel Import Apply 기능**
   - Import Preview(미리보기) 화면은 있으나, 최종 검증된 데이터를 실제 Store에 들이붓는(Apply) 과정 고도화.
