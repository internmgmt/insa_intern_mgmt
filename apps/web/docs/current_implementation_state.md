# Current Implementation State & Developer Handover (March 2, 2026)

This document provides a detailed snapshot of the project state for developers transitioning to local development or collaborating via Git.

## 1. Core Architecture Changes

### Frontend UI/UX Overhaul: The "Instagram-Style" Navigation
- **Architecture**: Shifted the primary navigational structure to a container-masking pattern.
- **Implementation**:
    - The `Sidebar` component (`/apps/web/src/components/sidebar.tsx`) is a fixed `w-[250px]` block.
    - The `DashboardLayout` (`/apps/web/src/app/dashboard/layout.tsx`) wraps the sidebar in an `aside` tag that transitions strictly from `w-[76px]` to `w-[250px]` with `overflow-hidden`.
    - **Why**: This produces a smooth, "sliding window" effect on hover without causing text to wrap, elements to shift, or ugly scrollbars to transiently appear.
    - **Alignments**: Icons and the main `LogoBlock` are hardcoded with margins (e.g. `pl-[18px]` for the logo) so that their horizontal center rests exactly at `38px`—the mathematical midpoint of the closed `76px` width container.

### Advanced Analytics Dashboard
- **Backend Service**: `DashboardService` (`/apps/api/src/dashboard/dashboard.service.ts`) provides aggregated metrics:
    - **Placement Rate**: (Interns / Students) percentage calculation.
    - **Distributions**: Status breakdown for apps, students, and submissions.
    - **Trends**: 6-month historical submission activity.
- **Frontend UI**: Custom-built, information-dense charting system in `/apps/web/src/components/ui/charts.tsx`:
    - `ProgressRing`: Visualizes success rates.
    - `AreaTrendChart`: Visualizes activity intensity over time.
    - `ModernBarChart`: Visualizes categorical distributions.

### PDF Export Engine Upgrade
- **Problem**: Previously, `html2canvas` failed to parse modern CSS pseudo-colors (`oklch()`, `oklab()`), causing PDF generation to break with a white screen.
- **Solution**: The `export-report.ts` utility was completely refactored to use an off-screen `iframe`. We inject a strict subset of CSS (`PRINT_STYLES`) containing normalized RGB colors directly into the frame, completely bypassing Tailwind's default compilation output when taking the canvas snapshot.

### Mentor grading and Task Evaluation
- **Task Max Score Constraint**: Mentors create tasks using a custom `maxScore`. The Submission review flow now defaults and caps grading inputs to this task-specific max limit instead of an arbitrary global value.
- **Feedback & Score Propagation**: Evaluated tasks now append their `score` and `feedback` metadata directly onto the Intern's PDF export via the `ReportTemplate` props mapping.
- **File Parsing**: Extended the `FilePreview` viewer logic to handle both scalar `fileUrl` fields (legacy/simple) and array `files` payloads (modern task submissions), allowing mentors to reliably view what interns uploaded.

## 2. Security Hardening (OWASP Compliance)

### Data Protection
- **Log Masking**: Implemented `maskSensitiveData` utility. The `RequestLoggerInterceptor` now automatically obscures `password`, `token`, and `credentials` fields in server logs.
- **Backend Security**: 
    - `Helmet` middleware integrated for secure HTTP headers.
    - `@nestjs/throttler` implemented for rate-limiting (100 requests / 60s) to prevent brute-force attacks.
- **Frontend Security**: `next.config.ts` updated with Strict-Transport-Security (HSTS), XSS Protection, and Referrer-Policy.
- **Storage**: Password hashing via `bcryptjs` is strictly enforced.

## 3. Workflow & Logic Updates

### Admin Flow
- **Intern Deletion**: Implemented a secure deletion flow in the Admin dashboard. Includes a confirmation modal requiring the user to type "DELETE" to prevent accidental data loss.
- **Approval Logic**: Fixed a state-machine bug. Admins can now move applications directly from `PENDING` (Draft) to `APPROVED` or `UNDER_REVIEW`.

### User Parsing Standardization
- **Referencing Models**: Standardized all UI logic to reliably use `intern.user.firstName` instead of legacy flat props like `intern.firstName`, preventing "Unknown Participant" errors in the Reports list.

## 4. Environment & Database

### Current Setup
- **Ports**: API on `5005`, Web on `3000`.
- **Docker**: Containers for `db` (Postgres 17), `redis`, `mailhog`, `api`, and `web`.
- **Containers Running**: Successfully built with `docker compose up --build web`; the system is entirely stable and online locally.
- **Database Status**: The `application.name` column is the most recent schema change. Ensure migrations are run when pulling locally.

## 5. Developer Handover / Git Strategy

**CRITICAL**: If you have been working directly on the server, your local changes are **not yet tracked by Git**.
1. **Local Clone**: Run `git clone <repo_url>` on your machine.
2. **Setup**: Run `npm install` and `docker compose up --build`.
3. **Environment**: Copy `.env.example` to `.env` in both `apps/api` and `apps/web`.
4. **Consistency**: Use different branches for Admin vs. Coordinator features to prevent merge conflicts in `lib/api.ts` or `app/dashboard/layout.tsx`.

## 6. Next Steps / TODOs
- [ ] Implement specialized dashboard views for **Supervisors** (focused on submission reviews).
- [ ] Complete specialized dashboard views for **Interns** (focused on task progress).
- [ ] Add unit tests for the complex `DashboardService` aggregation logic.
- [ ] Add comprehensive end-to-end tests for the new PDF generation iframe flow.
