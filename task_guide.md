# Task Guide — Backend Tasks 6–11

## Task files live in the repo root — implement as specified, test locally, then open a PR to merge into the backend branch.
-task must be done sequentially from 6-11.

Task files (open the file in repo root):
- backend_task_6_applications.md
- backend_task_7_interns.md  
- backend_task_8_submissions.md
- backend_task_9_documents.md  
- backend_task_10_dashboard.md
- backend_task_11_response_and_errors.md

Must-do checklist 
1. switch/checkout in to the branch for the task already avialable. 
2. Implement only the changes described in your task file. Mentioned files/paths in the task file are authoritative. Example refs: [apps/api/src/app.module.ts](apps/api/src/app.module.ts), [apps/api/src/main.ts](apps/api/src/main.ts), [apps/api/src/common/filters/http-exception.filter.ts](apps/api/src/common/filters/http-exception.filter.ts).  
3. Keep controller responses and errors consistent with spec files (use existing interceptors/filters). See [apps/api/src/common/interfaces/api-response.interface.ts](apps/api/src/common/interfaces/api-response.interface.ts).  
4. Add/adjust unit tests and e2e tests covering your changes. Run tests locally.  
5. Run migrations & seeds if schema or seed changes are required:  
   - Migrations: npm run migration:run --workspace=api  
   - Seed: npm run seed --workspace=api  
6. Run the API locally and verify flows end-to-end (use postman mainly but can use frontend too), make sure everything works correctly.
7. If there are any resolve any merge conflicts with the backend branch locally before pushing and asking for a pr request.
