export type UserRole = "ADMIN" | "UNIVERSITY" | "SUPERVISOR" | "INTERN";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  error: { code: string; details: unknown };
};

export type Pagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isFirstLogin: boolean;
  isActive: boolean;
  createdAt?: string;
  university?: { id: string; name: string } | null;
  department?: { id: string; name: string; type?: string } | null;
  intern?: { id: string; internId: string } | null;
};

export type LoginResponse = {
  user: User;
  token: string;
  expiresIn: string;
};

export type University = {
  id: string;
  name: string;
  address?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  isActive: boolean;
  createdAt?: string;
};

export type DepartmentType = "NETWORKING" | "CYBERSECURITY" | "SOFTWARE_DEVELOPMENT";

export type Department = {
  id: string;
  name: string;
  type: DepartmentType;
  description?: string | null;
  createdAt?: string;
};

export type ApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export type ApplicationListItem = {
  id: string;
  name?: string | null;
  academicYear: string;
  status: ApplicationStatus;
  officialLetterUrl: string;
  rejectionReason: string | null;
  studentCount: number;
  acceptedStudentCount: number;
  university: { id: string; name: string };
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type StudentStatus =
  | "PENDING_REVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "AWAITING_ARRIVAL"
  | "ARRIVED"
  | "ACCOUNT_CREATED";

export type Student = {
  id: string;
  firstName: string;
  lastName: string;
  studentId: string;
  fieldOfStudy: string;
  academicYear: string;
  email?: string | null;
  phone?: string | null;
  status: StudentStatus;
  rejectionReason?: string | null;
  cvUrl?: string | null;
  transcriptUrl?: string | null;
  createdAt?: string;
};

export type InternStatus = "ACTIVE" | "COMPLETED" | "TERMINATED";

export type InternListItem = {
  id: string;
  internId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  status: InternStatus;
  startDate: string | null;
  endDate: string | null;
  department: { id: string; name: string; type: string } | null;
  supervisor:
    | { id: string; firstName: string; lastName: string; email?: string | null }
    | null;
  university: { id: string; name: string } | null;
  /**
   * Convenience fields for filtering/grouping on the frontend.
   */
  universityId?: string | null;
  studentAcademicYear?: string | null;
  submissionCount: number;
  createdAt: string | null;
};

export type SubmissionType = "WEEKLY_REPORT" | "PROJECT_FILE" | "CODE" | "TASK" | "DOCUMENT";
export type SubmissionStatus = "PENDING" | "APPROVED" | "REJECTED" | "NEEDS_REVISION";

export type SubmissionListItem = {
  id: string;
  title: string;
  description: string;
  type: SubmissionType;
  status: SubmissionStatus;
  fileUrl: string | null;
  weekNumber: number | null;
  intern: { id: string; internId: string; firstName: string; lastName: string };
  supervisorFeedback: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

export type DocumentType = "OFFICIAL_LETTER" | "CV" | "TRANSCRIPT" | "CERTIFICATE" | "OTHER";
export type EntityType = "APPLICATION" | "STUDENT" | "INTERN";

export type DocumentInfo = {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  type: DocumentType;
  uploadedBy: { id: string; firstName: string; lastName: string } | string;
  entityId: string | null;
  entityType: EntityType | null;
  uploadedAt: string;
};
