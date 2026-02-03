import { InternEntity } from '../entities/intern.entity';
import { SubmissionEntity } from '../entities/submission.entity';

function toDepartmentResponse(intern: InternEntity) {
  if (!intern.department) return null;
  return {
    id: intern.department.id,
    name: intern.department.name,
    type: intern.department.type,
  };
}

function toSupervisorResponse(intern: InternEntity) {
  if (!intern.supervisor) return null;
  return {
    id: intern.supervisor.id,
    firstName: intern.supervisor.firstName,
    lastName: intern.supervisor.lastName,
    email: intern.supervisor.email,
  };
}

function toUserName(intern: InternEntity) {
  return {
    firstName: intern.user?.firstName ?? null,
    lastName: intern.user?.lastName ?? null,
    email: intern.user?.email ?? null,
  };
}

function calculateDaysRemaining(endDate?: Date | string | null) {
  if (!endDate) return 0;
  const end = new Date(endDate).getTime();
  if (Number.isNaN(end)) return 0;
  const diff = end - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function calculateCompletionPercentage(
  startDate?: Date | string | null,
  endDate?: Date | string | null,
) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
  const now = Date.now();
  const percent = ((now - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, percent));
}

function toSubmissionResponse(submission: SubmissionEntity) {
  return {
    id: submission.id,
    title: submission.title,
    description: submission.description,
    files: submission.files,
    status: submission.status,
    reviewedBy: submission.reviewedBy,
    reviewedAt: submission.reviewedAt,
    rejectionReason: submission.rejectionReason,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
  };
}

export class InternMapper {
  static toListResponse(intern: InternEntity & { submissionCount?: number }) {
    return {
      id: intern.id,
      internId: intern.internId ?? null,
      status: intern.status ?? null,
      isActive: intern.isActive ?? null,
      isSuspended: intern.isSuspended ?? false,
      suspensionReason: intern.suspensionReason ?? null,
      // Basic identity (from linked user)
      firstName: intern.user?.firstName ?? null,
      lastName: intern.user?.lastName ?? null,
      email: intern.user?.email ?? null,
      // Timeline
      startDate: intern.startDate ?? null,
      endDate: intern.endDate ?? null,
      // Organizational context
      department: toDepartmentResponse(intern),
      supervisor: toSupervisorResponse(intern),
      university: intern.student?.application?.university
        ? {
          id: intern.student.application.university.id,
          name: intern.student.application.university.name,
        }
        : null,
      // Useful for filtering/grouping on the frontend
      universityId: intern.student?.application?.university?.id ?? null,
      applicationName: intern.student?.application?.name ?? null,
      studentAcademicYear: intern.student?.academicYear ?? null,
      // Metrics
      submissionCount:
        typeof intern.submissionCount === 'number'
          ? intern.submissionCount
          : 0,
      createdAt: intern.createdAt ?? null,
    };
  }

  static toDetailResponse(intern: InternEntity) {
    const submissions = Array.isArray(intern.submissions)
      ? intern.submissions.map(toSubmissionResponse)
      : [];
    return {
      id: intern.id,
      internId: intern.internId ?? null,
      status: intern.status ?? null,
      isActive: intern.isActive ?? null,
      startDate: intern.startDate,
      endDate: intern.endDate,
      skills: intern.skills ?? [],
      interviewNotes: intern.interviewNotes ?? null,
      finalEvaluation: intern.finalEvaluation ?? null,
      completionNotes: intern.completionNotes ?? null,
      terminationReason: intern.terminationReason ?? null,
      certificateUrl: intern.certificateUrl ?? null,
      certificateIssued: intern.certificateIssued ?? false,
      department: toDepartmentResponse(intern),
      supervisor: toSupervisorResponse(intern),
      student: intern.student
        ? {
          id: intern.student.id,
          firstName: intern.student.firstName,
          lastName: intern.student.lastName,
          studentId: intern.student.studentId,
          email: intern.student.email,
          status: intern.student.status,
        }
        : null,
      submissions,
      ...toUserName(intern),
    };
  }

  static toProfileResponse(intern: InternEntity) {
    const submissions = Array.isArray(intern.submissions)
      ? [...intern.submissions]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5)
        .map(toSubmissionResponse)
      : [];
    return {
      id: intern.id,
      internId: intern.internId ?? null,
      status: intern.status ?? null,
      isActive: intern.isActive ?? null,
      startDate: intern.startDate,
      endDate: intern.endDate,
      daysRemaining: calculateDaysRemaining(intern.endDate),
      completionPercentage: calculateCompletionPercentage(
        intern.startDate,
        intern.endDate,
      ),
      recentSubmissions: submissions,
      skills: intern.skills ?? [],
      supervisor: toSupervisorResponse(intern),
      department: toDepartmentResponse(intern),
      ...toUserName(intern),
    };
  }
}
