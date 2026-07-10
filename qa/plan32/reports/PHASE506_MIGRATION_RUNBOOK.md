# Data Migration and Rollback Design

## 1. Inventory of Current Local Data
The current application relies on client-side state and mock files for data persistence:
- **Zustand Stores**: `authStore`, `projectStore`, `taskStore`, `processTemplateStore`, `qcStore`
- **Mock Seed Files**: `src/data/mockData.ts`, `src/data/workspaceScheduleSeed.ts`
- **Current IDs**: Hardcoded mock string IDs (e.g., `p1`, `p2`, `t1`, `admin1`, `worker1`).

## 2. ID Mapping and Ownership
- **ID Strategy**: PostgreSQL will use `UUIDv4` for all primary keys (`@id @default(uuid())`). The existing hardcoded IDs (e.g., `p1`) will be discarded and replaced by auto-generated UUIDs upon insertion.
- **Ownership**: Records (Projects, Tasks) currently assigned to mock users (`admin1`) will be dynamically linked to the actual UUIDs of authenticated users in the PostgreSQL database.

## 3. Data-Loss Risk Matrix

| Risk | Impact | Likelihood | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| **Local Storage Wipe** | Medium (Loss of any manually created tasks/projects in local browsers). | High (Zustand will be replaced by API). | Staging environment disclaimer: Users must be informed that all client-side mock data will be permanently wiped in favor of the authoritative server DB. No real production data exists yet, making this acceptable. |
| **Duplicate Seed Records** | Low | Low | DB Seed scripts will use Prisma's `upsert` method relying on unique constraints (e.g., `email` for Users, `title` for Process Templates) to ensure idempotency. |
| **Referential Integrity Failure** | High (Orphaned tasks/approvals). | Low | Prisma Schema enforces foreign key relationships. The migration script will insert data in strict dependency order (Users -> Projects -> Tasks -> Approvals). |

## 4. Migration Runbook (Draft)
When execution is approved in a later phase, the following steps will be executed:
1. **Schema Deployment**: Run `npx prisma migrate deploy` against the Render PostgreSQL Database.
2. **Seed Execution**: Run `npx ts-node prisma/seed.ts`.
3. **Validation**: Script verifies that at least 1 Admin user, 1 Project, and default Process Templates are successfully written via Prisma Client.
4. **Idempotency Check**: Running the seed script a second time must result in 0 new records created.

## 5. Rollback Plan
Since this is a fresh staging database, the primary rollback for a botched migration or corrupted seed is a complete database reset:
- **Command**: `npx prisma migrate reset --force`
- This drops the database, recreates it from the current Prisma schema, and automatically triggers the seed script again.
