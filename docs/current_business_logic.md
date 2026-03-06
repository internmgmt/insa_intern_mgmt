# Data Flow Analysis: File Upload & Submission

## 1. Current Implementation Status

### Breakage Identified
- **Frontend (`TasksPage`)**: Expects `uploadRes.data.fileUrl`.
- **Backend (`DocumentsService`)**: Returns `DocumentEntity` which has `url`, not `fileUrl`.
- **Result**: `fileUrl` is `undefined` when submitting the task. The submission records no file.

### Data Model Disconnect
- **`SubmissionEntity`**: Has `files` (text) column. No relationship to `DocumentEntity`.
- **`DocumentEntity`**: Has `url` (varchar) column which stores the local filesystem path (e.g., `uploads/abc-123`).
- **Goal**: To be able to download/view the file later.

## 2. Issues with "Store Path" Approach
If we fix the frontend to send the `path` (from `url` property) and store it in `SubmissionEntity.files`:
- When viewing the submission, we have the path `uploads/abc-123`.
- The frontend needs a way to download this.
- If we serve `uploads/` statically, it's insecure (anyone can guess paths).
- If we use `/api/documents/download/:id`, we need the **Document ID**, not the path.

## 3. Recommended Fix

We should store the `Document ID` in the submission, or at least the full download URL.
However, `SubmissionEntity` `files` is a text column.

### Option A: Store Document ID in `files` column (Hack)
- Frontend sends `uploadRes.data.id`.
- Backend stores ID in `files`.
- Frontend viewing: Fetches submission, gets `files` (which is an ID), constructs `/api/documents/${id}/download`.
- **Pros**: Easy to implement.
- **Cons**: `files` column name is misleading. No foreign key constraint.

### Option B: Store JSON in `files` or `data`
- Store `{ "documentId": "...", "url": "..." }` in `data` (jsonb) column.
- Or strictly use `files` to store the download URL (e.g., `/api/documents/download/UUID`).

### Option C: Fix Frontend to use `url` and Backend to serve it
- Frontend reads `uploadRes.data.url`.
- Frontend sends this path.
- Backend stores path.
- **Problem**: How to secure download? The current `DocumentsService.download` takes an ID. There is no endpoint to download by path.

## 4. Proposed Solution (Immediate Fix)

1.  **Frontend Fix**: In `TasksPage`, read `uploadRes.data.url` (the raw path) AND `uploadRes.data.id`.
2.  **Protocol Change**:
    - Instead of sending the raw path, send a "download URL" or "view URL".
    - Or better, simple store the `Document ID`.
    - `SubmissionEntity` has a `data` JSONB column. We should leverage it.

    **Plan**:
    1.  Frontend: `const docId = uploadRes.data.id;`
    2.  Frontend: Update submission with `data: { documentId: docId }` (and maybe `files: uploadRes.data.url` for legacy/debugging).
    3.  Backend `SubmissionsService`: Ensure `data` column can be updated.

    **Actually, checking `SubmissionEntity` again:**
    It has `files` (text).
    Most systems just store the URL.
    
    If we store `/api/documents/UUID` in `files` column:
    - Frontend can just render a link to that URL.
    - Security is handled by that endpoint (it checks token).

    **Revised Plan:**
    1.  **Frontend (`TasksPage`)**:
        - logical fix: `const fileUrl = uploadRes.data.url` is wrong because that's a file path.
        - We need to construct the download URL using the ID.
        - `const downloadUrl = /api/documents/${uploadRes.data.id}`.
        - Send `fileUrl: downloadUrl` to the submission endpoint.
    
    2.  **Verify**: Does `files` column allow storing that? Yes, it's text.
    
    3.  **Refinement**: `DocumentEntity` has `metadata`.
    
    4.  **Backend (`DocumentsService`)**:
        - Ensure `uploadRes.data` (the entity) is correctly returned. (Confirmed).

## Summary
The "fileUrl" property does not exist on the `DocumentEntity`. The frontend is trying to access `uploadRes.data.fileUrl` which is undefined. The `DocumentEntity` has `url` (file path) and `id`.

**Action Items:**
1.  Frontend: Modify `handleFinishTask` in `apps/web/src/app/dashboard/intern/tasks/page.tsx` to use `uploadRes.data.id` to construct a valid API URL, or use `uploadRes.data.url` if we want the raw path (not recommended).
2.  Best practice: Send `/api/documents/${uploadRes.data.id}` as the `fileUrl`.
