import { StudentEntity } from '../entities/student.entity';
import { ApplicationEntity } from '../entities/application.entity';

export class StudentMapper {
  static toListResponse(student: StudentEntity) {
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentId,
      email: student.email,
      phone: student.phone,
      fieldOfStudy: student.fieldOfStudy,
      academicYear: student.academicYear,
      status: student.status,
      applicationId: student.applicationId,
      applicationName: student.application?.name || null,
      university: student.application?.university
        ? {
          id: student.application.university.id,
          name: student.application.university.name,
        }
        : null,
      createdAt: student.createdAt,
    };
  }

  static toDetailResponse(student: StudentEntity) {
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      studentId: student.studentId,
      email: student.email,
      phone: student.phone,
      fieldOfStudy: student.fieldOfStudy,
      academicYear: student.academicYear,
      status: student.status,
      rejectionReason: student.rejectionReason,
      cvUrl: student.cvUrl,
      transcriptUrl: student.transcriptUrl,
      applicationId: student.applicationId,
      application: student.application
        ? {
          id: student.application.id,
          name: student.application.name,
          status: student.application.status,
          university: student.application.university
            ? {
              id: student.application.university.id,
              name: student.application.university.name,
            }
            : null,
        }
        : null,
      // intern: student.intern ? { ... } : null, // To be added if InternEntity relation exists
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }
}
