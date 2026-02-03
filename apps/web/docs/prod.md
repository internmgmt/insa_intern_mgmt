    # Intern Management System – Business Logic

    **1. University Application and Student Pre-Registration**

    Partner universities submit internship applications for their students. Each application includes a list
    of students, basic profile information such as full name, student ID, field of study, and academic year,
    as well as supporting documents like official letters. The system validates all submissions by checking
    required fields, verifying document formats, and ensuring that no duplicate student entries exist.

    **2. Organizational Review and Decision**

    All submitted applications enter a review queue managed by the Internship Office. Staff members
    evaluate each student's profile and attached documents. For every student, the organization will
    either accept or reject the application. If rejected, a clear and specific reason is provided to the
    university, and they are allowed to resubmit with corrections. If accepted, the student moves to the
    pre-internship processing stage.

    **3. Pre-Internship Processing for Accepted Students**

    Accepted students are placed into the organization’s Internship Intake List. At this point, no system
    account is created automatically. Account creation is initiated only by the Internship Administrator
    when the student physically arrives for screening or interviews. The system tracks which students
    have reported, which are pending, and which are scheduled for further review.

    **4. Student Interview and Profile Completion**

    When the student arrives for onboarding, the Internship Administrator verifies their identity,
    conducts an interview or skill assessment, and determines the appropriate department placement.
    Possible departments include Networking, Cybersecurity or Software Development. Additional profile
    details are collected, such as skills, internship duration, assigned department, supervisor or mentor,
    and official start and end dates.

    **5. System Account Creation**

    After interviews and profile completion, the Internship Administrator creates the intern’s system
    account. The system generates a unique intern ID, a user account with the role of “intern,” and
    temporary login credentials. The student receives instructions for logging in, completing their profile,
    and following organizational rules and policies.

    **6. Intern Portal Access and Activity Submission**

    Once logged into the system, interns can update their personal information( not all ), upload missing
    documents, and add skills. Interns can also submit their work, including weekly reports, project files,
    code, completed tasks, and other relevant attachments. Each submission is time-stamped and stored
    in the student’s profile.

    The system may also include optional attendance and daily activity logging features, where interns
    check in and out and supervisors validate their daily reports.

    **7. Supervisor and Department-Level Management( Optional )**

    Supervisors review submissions made by interns, approve or reject weekly reports, assign tasks and
    projects, and provide performance evaluations. Supervisors track the intern’s progress and provide
    structured feedback throughout the internship period.


    **8. Internship Office Oversight**

    The Internship Office monitors all active interns across departments, reviews performance summaries,
    examines supervisor feedback, and tracks overall progress. The office also manages reports,
    documentation, compliance records, and handles certificate approval processes.

    **9. Internship Completion and Certification**

    At the end of the internship period, supervisors perform a final evaluation for each intern. The system
    checks whether the intern has met all requirements, including duration, report submissions, and
    supervisor approval. If all criteria are met, the system generates an Internship Completion Certificate
    and a performance summary. These documents are made available to the intern, the university, and
    organizational records.

    ## ┌──────────────────────────┐

    University Submits
    Student Applications
    └──────────────────────────┘
    │
    ▼
    ┌──────────────────────────────────┐
    System Validates Applications
    (fields, documents, duplicates)
    └──────────────────────────────────┘
    │
    ▼
    ┌──────────────────────────────────────────┐
    Internship Office Reviews Each Student
    └──────────────────────────────────────────┘
    │
    ┌─────────────────────Accept?───────────────────────┐
    │ │
    ▼ ▼
    ┌─────────────────┐ ┌────────────────────────┐
    Reject Student Student Added to
    Provide Reason Internship Intake List
    └─────────────────┘ └────────────────────────┘
    │ │
    │ ▼
    │ ┌────────────────────────────────┐
    │ Student Arrives / Interview
    │ Profile Completion
    │ └────────────────────────────────┘
    │ │
    └───────────────<────────────┘ ▼
    ┌────────────────────┐
    Assign Department
    Add Additional Info
    └────────────────────┘
    │
    ▼
    ┌──────────────────────────────────────┐
    Internship Admin Creates Account
    (Intern ID, User Login, Temp Pass)
    └─────────────────┬────────────────────┘
    │


    ## ▼

    ## ┌──────────────────────────────────────────┐

    Intern Logs in to Portal
    Updates Profile, Uploads Work, Reports
    └──────────────────┬──────────────────────┘
    │
    ▼
    ┌─────────────────────────────────────────────┐
    Supervisor Reviews Work
    Approvals, Feedback, and Tracking
    └──────────────────┬──────────────────────────┘
    │
    ▼
    ┌──────────────────────────────────────────────────────────────┐
    Final Evaluation, Requirement Check, Certificate Issued
    └──────────────────────────────────────────────────────────────┘



