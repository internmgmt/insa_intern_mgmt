# Frontend UI Alignment Checklist (Spec + Business Logic)

Scope: apps/web only. Goal: make every page and action strictly follow the API spec and business flow. This is a planning document; implement after approval.

---

## Environment & Wiring

- [ ] Set env for proxying and base URL
  - [ ] `.env`: `NEXT_PUBLIC_API_BASE_URL=/api`
  - [ ] `.env`: `API_PROXY_TARGET=http://localhost:3000` (backend base URL)
  - [ ] `.env`: `NEXT_PUBLIC_ENABLE_MOCK_LOGIN=false` (strict mode)
- [ ] Use `apiFetch(token)` everywhere
  - [ ] Add a `useApi()` helper that reads token from `useAuth()` and wraps `apiFetch` with `Authorization`
  - [ ] Replace bare `fetch('/api/...')` calls across pages with typed service functions
- [ ] Error surfacing
  - [ ] Standardize toast and inline errors using `ApiRequestError` (show `error.code` where helpful)
- [ ] Pagination
  - [ ] All list pages send `?page&limit&filters...` and consume `{ items, pagination }`

---

## Auth

- [ ] Gate mock login behind `NEXT_PUBLIC_ENABLE_MOCK_LOGIN` in `src/components/auth-provider.tsx`
- [ ] Ensure `/auth/login`, `/auth/logout`, `/auth/me` use `auth-api.ts` and set token via `auth-storage.ts`

---

## Shared Service Modules (to add)

- [ ] `src/lib/services/users.ts`
- [ ] `src/lib/services/universities.ts`
- [ ] `src/lib/services/departments.ts`
- [ ] `src/lib/services/applications.ts`
- [ ] `src/lib/services/students.ts`
- [ ] `src/lib/services/interns.ts`
- [ ] `src/lib/services/submissions.ts`
- [ ] `src/lib/services/documents.ts`
- [ ] `src/lib/services/dashboard.ts`

Each module: exports typed functions that call `apiFetch` with `Authorization` header and match request/response shapes in spec.

---

## Admin

### Students — intake and arrival
File: `src/app/dashboard/admin/students/page.tsx`
- [ ] Replace direct status `PATCH /students/:id` with spec endpoints:
  - [ ] Review student: `POST /students/:id/review` with `{ decision: 'ACCEPTED' | 'REJECTED', rejectionReason? }`
  - [ ] Mark arrived: `POST /students/:id/mark-arrived`
- [ ] Remove free-form create student under `/students` (spec: students are added under applications)
  - [ ] If admin needs to add, it should happen via `POST /applications/:appId/students`
- [ ] Add pagination & filters (status, application, university, search) via query params per spec

### Interns — full lifecycle
File: `src/app/dashboard/admin/interns/page.tsx`
- [ ] Create intern from ARRIVED student: `POST /interns` with `{ studentId }` only; backend generates ID and account
- [ ] Remove manual student status flipping to `ACCOUNT_CREATED`
- [ ] Actions per intern row:
  - [ ] Assign supervisor: `POST /interns/:id/assign-supervisor` with `{ supervisorId }`
  - [ ] Complete internship: `POST /interns/:id/complete` with `{ finalEvaluation, completionNotes? }`
  - [ ] Terminate internship: `POST /interns/:id/terminate` with `{ reason }`
  - [ ] Issue certificate: `POST /interns/:id/issue-certificate` with `{ certificateUrl }` (after upload)
- [ ] Enforce status transitions and form validations
- [ ] Pagination & filters (status, department, supervisor, date range)

### Applications — review
File: `src/app/dashboard/admin/applications/page.tsx`
- [ ] Keep listing and approve/reject via `POST /applications/:id/review` with `{ decision, rejectionReason? }`
- [ ] Add pagination & filters (status, university, academicYear, date range)
- [ ] Show application summary fields per spec (acceptedStudentCount, reviewedBy, reviewedAt)

### Users
File: `src/app/dashboard/admin/users/page.tsx`
- [ ] Align to spec:
  - [ ] List users via `/users` with pagination and filters (role, isActive, departmentId, search)
  - [ ] Create user via `POST /users` with required fields per role
  - [ ] Update via `PATCH /users/:id`; deactivate via `DELETE /users/:id` (soft delete)
- [ ] Remove ability to create `INTERN` users directly (intern accounts come from intern creation flow)
- [ ] Remove non-spec fields mapping like `status`, `lastActive` used as placeholders

### Universities, Departments, Submissions, Documents
- [ ] Universities (`/universities`): CRUD with isActive field; pagination/filters
- [ ] Departments (`/departments`): CRUD; enforce immutable `type` after creation
- [ ] Submissions (`/submissions`): list oversight; no admin review action (review is supervisor)
- [ ] Documents (`/documents`): list and delete; download via `/documents/:id` (binary)

---

## University

### Applications — create, edit, submit
File: `src/app/dashboard/university/applications/page.tsx`
- [ ] Create: `POST /applications` with `{ academicYear }` only (studentCount is server-computed)
- [ ] Edit: `PATCH /applications/:id` with `{ academicYear, officialLetterUrl? }`; remove arbitrary fields
- [ ] Submit: `POST /applications/:id/submit` with gating:
  - [ ] At least 1 student in the application
  - [ ] `officialLetterUrl` present
  - [ ] Status is `PENDING`
- [ ] Remove `DELETE /applications/:id` (not in spec)
- [ ] File upload for official letter:
  - [ ] `POST /documents/upload` (multipart) with `{ file, type: 'OFFICIAL_LETTER', entityType: 'APPLICATION', entityId }`
  - [ ] On success, set `officialLetterUrl` via `PATCH /applications/:id`
- [ ] Pagination & filters (status, academicYear)

### Students — under application only
File: `src/app/dashboard/university/students/page.tsx`
- [ ] List students of an application: `GET /applications/:appId/students`
- [ ] Add student: `POST /applications/:appId/students` (enforce uniqueness of `studentId` per spec)
- [ ] Update student: `PATCH /applications/:appId/students/:id` (only when app is PENDING/REJECTED)
- [ ] Remove student: `DELETE /applications/:appId/students/:id` (only when app is PENDING)
- [ ] Upload CV/Transcript via `/documents/upload`, set URLs on student

- [ ] Documents page: can remain for convenience, but actions should use `/documents` endpoints with proper types

---

## Supervisor

### Submissions review
File: `src/app/dashboard/supervisor/submissions/page.tsx`
- [ ] List submissions with filters (status, type, internId, date range)
- [ ] Review action: `POST /submissions/:id/review` with `{ decision: 'APPROVED'|'REJECTED'|'NEEDS_REVISION', feedback }` (feedback required)
- [ ] Enforce department scoping (server-side); surface 403 errors

### Interns & Departments
- [ ] List interns in own department; pagination/filters
- [ ] Departments view restricted to allowed actions per spec (mostly read-only for supervisor)
- [ ] Messages page: optional (allowed by business doc)

---

## Intern

### Submissions
File: `src/app/dashboard/intern/submissions/page.tsx`
- [ ] Create: `POST /submissions` with required fields per type
  - [ ] WEEKLY_REPORT requires `weekNumber (1-52)`
  - [ ] PROJECT_FILE/CODE/DOCUMENT require `fileUrl` (upload first via `/documents/upload`)
- [ ] Update: `PATCH /submissions/:id` only when `PENDING` or `NEEDS_REVISION`; `type` and `weekNumber` immutable after creation
- [ ] My submissions listing: `GET /submissions/my` with filters
- [ ] Enforce intern status ACTIVE for create/update

### Profile & Documents
- [ ] Limited profile updates per spec (skills only or as allowed)
- [ ] Upload documents allowed with appropriate `type` and entity linkage

---

## Documents (Upload/Download)

- [ ] Upload helper (shared):
  - [ ] Use `FormData`; validate size ≤ 10MB; restrict extensions by `type`
  - [ ] On success, store returned `fileUrl`/`id` and update related entity via PATCH
- [ ] Download helper: `GET /documents/:id` (Blob), set correct filename in `Content-Disposition`

---

## RBAC & UI Visibility

- [ ] Hide/disable buttons based on role and current entity status to prevent invalid actions
- [ ] Keep server as source of truth; optimistic UI only where safe

---

## Cleanup & De-risking

- [ ] Replace any non-spec endpoints or placeholder fields across pages
- [ ] Ensure all screens handle loading/empty/error states consistently (skeletons, empty states, toasts)
- [ ] Add basic unit tests for service modules (if test infra available)

---

## Implementation Order (Suggested)

1) Add `useApi()` and service modules; refactor Admin Users + Applications to the pattern
2) University Applications: upload + submit gating; Students scoped under application
3) Admin Students: review and arrival endpoints
4) Admin Interns: create from ARRIVED + lifecycle actions
5) Supervisor Submissions: review with required feedback
6) Intern Submissions: type-specific validation and flows
7) Documents: shared upload/download helpers across pages

---

## Quick References (Files)

- Layouts & providers: `src/app/layout.tsx`, `src/app/providers.tsx`, `src/app/dashboard/layout.tsx`
- Auth: `src/components/auth-provider.tsx`, `src/lib/auth-api.ts`, `src/lib/auth-storage.ts`
- API core: `src/lib/api.ts`, `src/lib/types.ts`
- Proxy: `src/app/api/[...path]/route.ts`
- Example pages to refactor first:
  - Admin Users: `src/app/dashboard/admin/users/page.tsx`
  - Admin Applications: `src/app/dashboard/admin/applications/page.tsx`
  - University Applications: `src/app/dashboard/university/applications/page.tsx`
  - Admin Students: `src/app/dashboard/admin/students/page.tsx`
  - Admin Interns: `src/app/dashboard/admin/interns/page.tsx`
