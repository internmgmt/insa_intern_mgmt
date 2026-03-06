# Intern Management System – Updated Business Logic (March 2, 2026)

This document outlines the current business logic and workflow of the system, incorporating recent updates to security, visibility, user experience, and mentor evaluation flows.

## 1. Application Lifecycle & Student Visibility
- **Submission**: Universities submit batch applications with specific `studentCount` and attached PDF documents.
- **Visibility Restrictions**: 
    - Students within an application that is in `UNDER_REVIEW` or `PENDING` status are **hidden** from general Supervisor views.
    - Only the **Admin** and the **Submitting University** can view students in these pre-approval states.
    - This ensures that internal review processes remain confidential and that the pool of "available" interns is not polluted with unverified candidates.
- **Workflow Transitions**: Applications move from `PENDING` -> `UNDER_REVIEW` -> `APPROVED`/`REJECTED`.

## 2. Authentication & Security Onboarding
- **First Login Protocol**: 
    - All newly created accounts are flagged with `isFirstLogin: true`.
    - Upon initial login, the system enforces a **Mandatory Password Change**.
    - The user is redirected to the Change Password screen and navigation to other dashboard features is disabled until the password is updated.
- **Password Complexity**: 
    - Minimum length: **12 characters**.
    - Complexity: Must include uppercase, lowercase, numbers, and at least one special character.
    - Supported Symbols: Broad support for all non-alphanumeric characters (e.g., `{`, `~`, `$`, `%`, `&`, `*`).

## 3. Executive Dashboard & Reporting
- **Real-Time Analytics**: The Admin dashboard provides a high-level "Processing Pipeline" visualization using interactive Donut Charts.
- **Metric Definitions**:
    - **Placement Rate**: Calculated as Active Interns vs. Total Registered Students.
    - **Department Deployment**: Tracks the distribution of interns across organizational units (SoftEng, Networking, etc.).
    - **Partner Distribution**: Ranks universities by successful application volume.

## 4. UI/UX Standard & Navigation Paradigms
- **Instagram-Style Sidebar Navigation**:
    - The main navigation paradigm uses a smooth, expand-on-hover sidebar masked layout.
    - **Container Masking**: The inner component maintains a rigid `250px` width, while the outer container animatedly expands its clipping mask from `76px` to `250px`. This prevents mid-animation text warping or scrollbars.
    - **Mathematical Centering**: Icons and logos are absolutely centered inside the `76px` resting bounds so no layout shift occurs upon hover.
- **Visual Integrity**: 
    - **Solid Surfaces**: Transparency modifiers are removed from card backgrounds, headers, and modals to ensure maximum readability and a premium "solid" feel.
    - **Glass Effects**: Used sparingly for interaction cues, but core content surfaces remain strictly opaque.

## 5. University Interaction
- **Verification of Intake**: Universities can monitor the progress of their students through the pipeline.
- **Data Accuracy**: Student counts are derived dynamically from application metadata, ensuring that the counts displayed to the university match the actual processed items in the backend.

## 6. Document Management & PDF Export
- **Centralized Storage**: All supporting identifiers and academic records are stored with role-based access controls.
- **Print-Style PDF Generation**: Weekly reports and evaluations are exported to precisely styled PDFs. 
    - The system leverages an off-screen `iframe` populated with print-specific CSS (`PRINT_STYLES`) to render the page layout accurately.
    - This allows high-fidelity `html2canvas` snapshots without relying on native browser print dialogs, bypassing modern CSS color-function rendering bugs.

## 7. Departmental Hierarchy & Mentorship
- **The Singleton Supervisor (HoD)**: Each department is led by exactly **one Supervisor** (Head of Department). The HoD has total oversight of all interns, mentors, and activities within their department.
- **Mentor Provisioning**:
    - HoDs use a dedicated **Mentor Management** tab to onboard staff. 
    - Uses automated 12-character secure password generation dispatched via email.
    - **Role Restriction**: The `MENTOR` role is strictly a specialized departmental role and is hidden from the global Admin dropdown.
- **Sub-Division Isolation**:
    - Mentors exclusively see interns directly assigned to them by their HoD.
    - HoDs maintain a master view of *all* mentors and interns in the department.

## 8. Intern Onboarding, Task Assignment & Mentor Grading
- **Intern Workflow**:
    - Admin/HoD assign verified interns to a specific **Mentor**.
    - Mentors serve as the primary technical leads, responsible for issuing tasks and reviewing submission documents.
- **Task Evaluation & Scoring**:
    - When Mentors create tasks, they assign a specific `maxScore` (e.g., out of 100 or 10).
    - As interns submit their files, Mentors review indigenous uploads (via a `FilePreview` modal matched against `fileUrl` or `files`) and assign a score bounded by that `maxScore`.
    - **Feedback Persistence**: Mentor scores and textual feedback are recorded onto the submission payload, and subsequently appended directly onto the generated PDF Weekly Report so universities and supervisors have certified proof of grading.
