# Current Implementation State & Developer Handover (Feb 3, 2026)

This document provides a detailed snapshot of the project state for developers transitioning to local development or collaborating via Git.

## 1. Core Architecture Changes

### Application Batch Naming
- **Feature**: Replaced UUID-only identification with human-friendly `name` strings (e.g., "Software Engineering Fall 2025").
- **Backend**: 
    - `ApplicationEntity` updated with a non-nullable `name` column.
    - Updated `CreateApplicationDto` and `ApplicationMapper`.
- **Frontend**: All tables in Admin and University views now display the Application Name as the primary identifier.

### Advanced Analytics Dashboard
- **Backend Service**: `DashboardService` (`/apps/api/src/dashboard/dashboard.service.ts`) provides aggregated metrics:
    - **Placement Rate**: (Interns / Students) percentage calculation.
    - **Distributions**: Status breakdown for apps, students, and submissions.
    - **Trends**: 6-month historical submission activity.
- **Frontend UI**: Custom-built, information-dense charting system in `/apps/web/src/components/ui/charts.tsx`:
    - `ProgressRing`: Visualizes success rates.
    - `AreaTrendChart`: Visualizes activity intensity over time.
    - `ModernBarChart`: Visualizes categorical distributions.

### Identity & Access Management
- **User Provisioning**: Admin user creation now supports `departmentId` for Supervisors. 
- **Automated Credentials**: The system now handles temporary password generation (12-char random string) and automatic email dispatch upon account creation. Admins no longer manually set passwords.
- **Improved UI**: Redesigned `Identity & Access` registry with status indicators (Active vs Suspended) and quick-action toggles.

### Organizational Structure
- **Unit Management**: The `Departments` screen now uses a high-density card grid. Units are categorized by technical domain (Networking, Cyber, SoftEng).
- **Resource Tracking**: Each unit card displays real-time human capital (intern count) and head of department assignments.

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

### University Flow
- **Student Data**: Standardized academic year labels (e.g., "1st Year", "2nd Year").
- **Profile Management**: University contact information (Email/Phone) visibility fixed in the admin management view.

## 4. Environment & Database

### Current Setup
- **Ports**: API on `5005`, Web on `3000`.
- **Docker**: Containers for `db` (Postgres 17), `redis`, `mailhog`, `api`, and `web`.
- **Database Status**: The `application.name` column is the most recent schema change. Ensure migrations are run when pulling locally.

## 5. Developer Handover / Git Strategy

**CRITICAL**: If you have been working directly on the server, your local changes are **not yet tracked by Git**. 
1. **Local Clone**: Run `git clone <repo_url>` on your machine.
2. **Setup**: Run `npm install` and `docker compose up --build`.
3. **Environment**: Copy `.env.example` to `.env` in both `apps/api` and `apps/web`.
4. **Consistency**: Use different branches for Admin vs. Coordinator features to prevent merge conflicts in `lib/api.ts` or `app/dashboard/layout.tsx`.

## 6. Next Steps / TODOs
- [ ] Implement specialized dashboard views for **Supervisors** (focused on submission reviews).
- [ ] Implement specialized dashboard views for **Interns** (focused on task progress).
- [ ] Add unit tests for the complex `DashboardService` aggregation logic.
- [ ] Finalize document upload/download validation for large files.
