# Workspace Test Matrix

이 문서는 통합업무관리 시스템(Workspace)의 전체 기능과 권한, 데이터 연동이 안정적으로 작동하는지 검증하기 위한 통합 테스트 시나리오입니다.

## 1. Role Permission Tests
| Test Case ID | Role | Action | Expected Result |
|---|---|---|---|
| PERM-001 | SUPER_ADMIN | 프로젝트 목록 조회 | 전체 부서의 모든 프로젝트 노출 |
| PERM-002 | DEPARTMENT_MANAGER | 프로젝트 목록 조회 | 본인 소속 부서의 프로젝트만 노출 |
| PERM-003 | PM | 프로젝트 목록 조회 | 자신이 PM으로 지정된 프로젝트만 노출 |
| PERM-004 | WORKER | 업무 카드 드래그 (담당자 변경) | 권한 오류 알림(`작업자는 타인에게 업무를 배정할 수 없습니다.`) 표출 |
| PERM-005 | ALL | 타인 소유 카드 상세 접근 (직접 URL) | 데이터를 불러오지 않거나 권한 없음 에러 반환 |

## 2. Project Intake Tests
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| INTK-001 | 신규 프로젝트 등록 요청 | `status: INTAKE_RECEIVED`, 중간관리자에게 알림 발송 |
| INTK-002 | 접수건 PM 배정 | `status: PM_ASSIGNED`로 변경, PM에게 일정 초안 작성 알림 발송 |

## 3. PM Assignment Tests
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| PM-001 | PM이 프로젝트 공정표(Schedule Plan) 초안 작성 완료 | `status: SCHEDULE_PENDING_APPROVAL`로 변경, 중간관리자 승인 대기열에 진입 |
| PM-002 | 중간관리자 승인 완료 | `status: SCHEDULE_APPROVED`로 변경, 공정표 확정 처리 |

## 4. Schedule Approval Tests
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| SCH-001 | 개인 일정(반차 등) 신청 | 신청자의 `ApprovalRequest` 생성, 해당 중간관리자 승인 메뉴 노출 |
| SCH-002 | 일정 승인 반려 | `ApprovalRequest.status: REJECTED` 변경, 반려 사유와 함께 알림 발송 |

## 5. Task Board Tests
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| BRD-001 | 카드를 '대기'에서 '진행 중' 컬럼으로 이동 | 카드의 `status`가 `IN_PROGRESS`로 변경됨, 진행률 초기화 되지 않음 |
| BRD-002 | 프리셋 '작업자별 부하' 선택 | 보드 기준이 담당자별(ASSIGNEE)로 동적 생성, 타 부서 미지정 카드 노출 배제 |
| BRD-003 | 담당자별 컬럼 간 카드 이동 (PM 권한) | 카드의 `assigneeId`가 드롭된 컬럼의 사용자 ID로 변경 |
| BRD-004 | 보드에서 'Off/Day' 필터 토글 On | 개인 휴무 일정이 카드 형태로 보드에 렌더링되며 드래그 불가능 |

## 6. Schedule Table Tests (VN Excel Seed)
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| EXC-001 | VN 월별 엑셀 기반 `ScheduleAssignment` 렌더링 | 파싱된 엑셀 데이터가 달력/보드에 1:1로 누락 없이 표현됨 |
| EXC-002 | 연속된 동일 업무의 단일 카드 그룹핑 | `Scope`, `Project`, `Assignee`가 같은 연속된 일정이 1개의 `TaskCard`로 표시됨 |

## 7. Completion Workflow Tests
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| CMP-001 | 작업자가 완료 버튼 클릭 시 진행률 점프 | 기존 10% -> 100% 점프 시 사유(진행 메모) 입력 폼 활성화 강제 |
| CMP-002 | 작업자 완료 요청 제출 | `completionStatus: PM_REVIEWING` 변경, 보드 상에 승인 대기 표시 |
| CMP-003 | PM이 완료 검토 후 승인 | `completionStatus: MANAGER_REVIEWING`으로 상태 전이 |

## 8. GitHub Pages Routing Tests
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| GHP-001 | 정적 라우팅 접근 | URL `/workspace/` 접근 시 메인 대시보드 로딩 |
| GHP-002 | 하위 경로 새로고침 | `/workspace/projects` 페이지 새로고침 시 404가 발생하지 않고 페이지 유지 (또는 404.html 경유 정상 랜딩) |
| GHP-003 | 존재하지 않는 URL 접근 | 404.html 커스텀 에러 페이지가 화면에 출력되고 홈 버튼 제공 |

## 9. Plan 17 Workflow Tests
| Test Case ID | Scenario | Expected Result |
|---|---|---|
| P17-001 | 수주 프로젝트 및 개발팀 업무 생성 (Intake) | 각 탭에서 생성 시 `CLIENT_ORDER`, `INTERNAL_DEVELOPMENT`로 타입이 분리 생성되며 첫 번째 컬럼(착수 전)에 노출 |
| P17-002 | PM 하달 모달 로직 | PM이 `착수 전` 항목을 `진행 중`으로 이동 시 하달 워크플로우(PmDispatchModal)가 활성화됨 |
| P17-003 | 하달 후 프로젝트 상태 전이 | 작업자 및 세부업무 지정이 완료되어야 프로젝트가 `IN_PROGRESS`로 확정 |
| P17-004 | 작업자 추가 일정 연장 요청 | 작업자가 Task에서 연장 요청 시 상태가 PENDING 승인대기상태가 되며 원본 데이터는 변하지 않음 |
| P17-005 | 추가 일정 연장 요청 승인 | 승인 권한자가 결재 승인 시 원본 TaskCard 및 일정표(TaskWorkSegment)에 목표 기한(dueDate)이 즉시 반영 |
| P17-006 | 사후 수정 (Revision) 워크플로우 | 완료된 업무에 수정 요청 발생 시, 프로젝트가 보드의 맨 우측 `수정(Revision)` 컬럼으로 즉시 이동 |
