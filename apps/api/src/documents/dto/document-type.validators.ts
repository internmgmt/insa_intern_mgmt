import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { StudentEntity } from '../../entities/student.entity';
import { ApplicationEntity } from '../../entities/application.entity';

export function validateUniversityDocumentType(docType: string): void {
  const allowed = ['OFFICIAL_LETTER', 'CV', 'TRANSCRIPT'];
  if (!allowed.includes(docType)) {
    throw new ForbiddenException({
      success: false,
      message:
        'Universities can only upload OFFICIAL_LETTER, CV, or TRANSCRIPT documents',
      error: { code: 'DOCUMENT_TYPE_NOT_ALLOWED', details: null },
    });
  }
}

export function validateInternDocumentType(docType: string): void {
  const allowed = ['SUBMISSION'];
  if (!allowed.includes(docType)) {
    throw new ForbiddenException({
      success: false,
      message: 'Interns can only upload submission files',
      error: { code: 'DOCUMENT_TYPE_NOT_ALLOWED', details: null },
    });
  }
}

export async function validateApplicationOwnership(
  applicationRepository: Repository<ApplicationEntity>,
  applicationId: string,
  universityId: string,
): Promise<void> {
  const application = await applicationRepository.findOne({
    where: { id: applicationId },
  });

  if (!application) {
    throw new BadRequestException({
      success: false,
      message: 'Application not found',
      error: { code: 'APPLICATION_NOT_FOUND', details: null },
    });
  }

  if (application.universityId !== universityId) {
    throw new ForbiddenException({
      success: false,
      message: 'You act on behalf of another university',
      error: { code: 'APPLICATION_NOT_OWNED', details: null },
    });
  }
}

export async function validateStudentOwnership(
  studentRepository: Repository<StudentEntity>,
  studentId: string,
  universityId: string,
): Promise<StudentEntity> {
  const student = await studentRepository.findOne({
    where: { id: studentId },
    relations: ['application'],
  });

  if (!student) {
    throw new BadRequestException({
      success: false,
      message: 'Student not found',
      error: { code: 'STUDENT_NOT_FOUND', details: null },
    });
  }

  if (student.application?.universityId !== universityId) {
    throw new ForbiddenException({
      success: false,
      message: 'You act on behalf of another university',
      error: { code: 'STUDENT_NOT_OWNED', details: null },
    });
  }

  return student;
}
