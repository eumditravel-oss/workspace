# EUMDI OS JSON Handoff Schema

이 문서는 EUMDI OS 워크스페이스 상태를 내보내고 가져오기 위한 JSON 스키마(`WorkspaceExportData`) 명세입니다.
정적 웹 호스팅 환경(GitHub Pages)의 한계를 극복하기 위해 Node.js 스크립트와 통합됩니다.

## 1. 버전 정보
- **Current schemaVersion**: `1.0.0`

## 2. 기본 구조 (Root Object)

```typescript
export interface WorkspaceExportData {
  schemaVersion: string; // 호환성 검사를 위한 버전 ("1.0.0")
  exportedAt: string;    // ISO 8601 Date 문자열
  exportedBy: string;    // 내보낸 사용자 이름 또는 ID
  data: {
    projects: Project[];
    tasks: TaskCard[];
    personnel: PersonnelCard[];
    settings: WorkspaceSetting[];
  };
}
```

## 3. Data 객체

### 3.1 `projects`
전체 프로젝트 데이터 배열입니다.
- 필수 속성: `id`, `name`, `status`, `createdAt`, `updatedAt` 등 `Project` 모델 준수

### 3.2 `tasks`
전체 업무(Task) 데이터 배열입니다.
- 필수 속성: `id`, `projectId`, `title`, `status`, `assigneeId` 등 `TaskCard` 모델 준수

### 3.3 `personnel`
전체 인원(User) 정보 배열입니다.
- 필수 속성: `id`, `name`, `role`, `departmentId` 등 `PersonnelCard` 모델 준수

### 3.4 `settings`
워크스페이스 설정 정보 배열입니다.
- 필수 속성: `id`, `category`, `key`, `value`, `editableByRoles` 등 `WorkspaceSetting` 모델 준수

---

## 4. 관련 스크립트 (CLI)

JSON Handoff를 처리하기 위한 npm 스크립트가 포함되어 있습니다.
- `npm run json:export`: 현재 Mock/Dummy 데이터 기반으로 빈 구조를 생성합니다. (`scripts/export-current-state.ts`)
- `npm run json:import`: `json/workspace-export.json` 파일을 읽어 `src/data/operationData.ts` 로 변환하여 번들에 포함시킵니다. (`scripts/import-json-data.ts`)
- `npm run json:validate`: `json/workspace-export.json` 파일의 스키마와 필수 데이터 유효성을 검사합니다. (`scripts/validate-json-data.ts`)
