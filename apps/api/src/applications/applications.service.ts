import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationEntity } from '../entities/application.entity';
import { StudentEntity } from '../entities/student.entity';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { StudentStatus } from '../common/enums/student-status.enum';
import { UserRole } from '../common/enums/user-role.enum';
import { DocumentEntity } from '../entities/document.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
  ) { }

  async createApplication(createApplicationDto: any) {
    const { academicYear, officialLetterUrl, universityId, students, name } =
      createApplicationDto;

    const safeOfficialLetterUrl = officialLetterUrl || '';

    const application = new ApplicationEntity();
    application.academicYear = academicYear;
    application.name = name;
    application.officialLetterUrl = safeOfficialLetterUrl;
    application.universityId = universityId;
    application.status = ApplicationStatus.PENDING;

    const saved = await this.applicationRepository.save(application);

    // Link official letter document if it exists
    if (officialLetterUrl) {
      await this.linkDocument(officialLetterUrl, {
        entityType: 'APPLICATION',
        entityId: saved.id,
        applicationId: saved.id,
        documentType: 'OFFICIAL_LETTER',
      });
    }

    // If students are provided, create them
    if (students && Array.isArray(students) && students.length > 0) {
      for (const studentDto of students) {
        const student = new StudentEntity();
        Object.assign(student, studentDto);
        student.applicationId = saved.id;
        student.status = studentDto.status || StudentStatus.PENDING_REVIEW;

        const savedStudent = await this.studentRepository.save(student);

        // Link student documents
        if (studentDto.cvUrl) {
          await this.linkDocument(studentDto.cvUrl, {
            entityType: 'STUDENT',
            entityId: savedStudent.id,
            studentId: savedStudent.id,
            applicationId: saved.id,
            documentType: 'CV',
          });
        }
        if (studentDto.transcriptUrl) {
          await this.linkDocument(studentDto.transcriptUrl, {
            entityType: 'STUDENT',
            entityId: savedStudent.id,
            studentId: savedStudent.id,
            applicationId: saved.id,
            documentType: 'TRANSCRIPT',
          });
        }
      }
    }

    const result = await this.applicationRepository.findOne({
      where: { id: saved.id },
      relations: ['students', 'university'],
    });

    return {
      success: true,
      message: 'Application created successfully',
      data: result,
    };
  }

  private async linkDocument(url: string, meta: any) {
    try {
      const doc = await this.documentRepository.findOne({ where: { url } });
      if (doc) {
        let existingMeta = {};
        try {
          existingMeta = doc.metadata ? JSON.parse(doc.metadata) : {};
        } catch (e) { }

        const newMeta = { ...existingMeta, ...meta };
        doc.metadata = JSON.stringify(newMeta);
        if (meta.studentId) {
          doc.studentId = meta.studentId;
        }
        await this.documentRepository.save(doc);
      }
    } catch (error) {
      this.logError('linkDocument', error);
    }
  }

  private logError(method: string, error: any) {
    console.error(`Error in ApplicationsService.${method}:`, error);
  }

  async updateApplication(id: string, updateApplicationDto: any) {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException({
        success: false,
        message: 'Application not found',
        error: {
          code: 'APPLICATION_NOT_FOUND',
          details: null,
        },
      });
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException({
        success: false,
        message: 'Application can only be updated in PENDING status',
        error: {
          code: 'APPLICATION_NOT_EDITABLE',
          details: { status: application.status },
        },
      });
    }

    const { officialLetterUrl } = updateApplicationDto;

    Object.assign(application, updateApplicationDto);
    const updated = await this.applicationRepository.save(application);

    // Link official letter if updated
    if (officialLetterUrl) {
      await this.linkDocument(officialLetterUrl, {
        entityType: 'APPLICATION',
        entityId: updated.id,
        applicationId: updated.id,
        documentType: 'OFFICIAL_LETTER',
      });
    }

    return {
      success: true,
      message: 'Application updated successfully',
      data: updated,
    };
  }

  async submitForReview(id: string) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['students'],
    });
    if (!application) {
      throw new NotFoundException({
        success: false,
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', details: null },
      });
    }
    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException({
        success: false,
        message: 'Only PENDING applications can be submitted',
        error: { code: 'APPLICATION_NOT_SUBMITTABLE', details: null },
      });
    }
    if (!application.officialLetterUrl) {
      throw new BadRequestException({
        success: false,
        message: 'Official letter is required for submission',
        error: { code: 'OFFICIAL_LETTER_REQUIRED', details: null },
      });
    }
    if (!application.students || application.students.length === 0) {
      throw new BadRequestException({
        success: false,
        message: 'At least one student is required for submission',
        error: { code: 'STUDENTS_REQUIRED', details: null },
      });
    }

    application.status = ApplicationStatus.UNDER_REVIEW;
    const saved = await this.applicationRepository.save(application);

    return {
      success: true,
      message: 'Application submitted for review',
      data: saved,
    };
  }

  async list(query: any) {
    const { page = 1, universityId, status, academicYear } = query;
    const limit = 100; // Enforce strict 100 limit as requested
    const qb = this.applicationRepository.createQueryBuilder('application');
    qb.leftJoinAndSelect('application.university', 'university');
    qb.loadRelationCountAndMap('application.studentCount', 'application.students');

    if (universityId) {
      qb.andWhere('application.universityId = :universityId', { universityId });
    }
    if (status) {
      qb.andWhere('application.status = :status', { status });
    }
    if (academicYear) {
      qb.andWhere('application.academicYear = :academicYear', { academicYear });
    }

    qb.skip((page - 1) * limit);
    qb.take(limit);
    qb.orderBy('application.createdAt', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Applications fetched successfully',
      data: {
        items,
        pagination: {
          totalItems: total,
          totalPages: Math.ceil(total / limit),
          page: Number(page),
          limit: Number(limit),
        },
      },
    };
  }

  async findById(id: string, currentUser: { id: string; role: string; universityId?: string }) {
    const qb = this.applicationRepository.createQueryBuilder('application');
    qb.leftJoinAndSelect('application.university', 'university');
    qb.leftJoinAndSelect('application.students', 'students');
    qb.where('application.id = :id', { id });

    const application = await qb.getOne();

    if (!application) {
      throw new NotFoundException({
        success: false,
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', details: null },
      });
    }

    if (currentUser.role === UserRole.UNIVERSITY && application.universityId !== currentUser.universityId) {
      throw new ForbiddenException({
        success: false,
        message: 'You do not have permission to view this application',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }

    return {
      success: true,
      message: 'Application fetched successfully',
      data: application,
    };
  }

  async findLatestEditableByUniversity(universityId: string) {
    return this.applicationRepository.findOne({
      where: {
        universityId,
        status: ApplicationStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findByIdWithoutResponse(id: string) {
    return this.applicationRepository.findOne({
      where: { id },
      relations: ['students'],
    });
  }

  async deleteApplication(id: string, currentUser: { role: string; universityId?: string }) {
    const application = await this.applicationRepository.findOne({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException({
        success: false,
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', details: null },
      });
    }

    if (currentUser.role === UserRole.UNIVERSITY && application.universityId !== currentUser.universityId) {
      throw new ForbiddenException({
        success: false,
        message: 'Permission denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }

    await this.applicationRepository.save({
      ...application,
      status: ApplicationStatus.ARCHIVED,
    });

    return {
      success: true,
      message: 'Application archived successfully',
    };
  }

  async reviewApplication(
    id: string,
    reviewerId: string,
    body: { decision: 'APPROVE' | 'REJECT'; rejectionReason?: string },
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id },
      relations: ['students'],
    });

    if (!application) {
      throw new NotFoundException({
        success: false,
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', details: null },
      });
    }

    if (
      application.status !== ApplicationStatus.UNDER_REVIEW &&
      application.status !== ApplicationStatus.PENDING
    ) {
      throw new BadRequestException({
        success: false,
        message: 'Only applications in UNDER_REVIEW or PENDING status can be reviewed',
        error: { code: 'APPLICATION_NOT_REVIEWABLE', details: null },
      });
    }

    application.status =
      body.decision === 'APPROVE'
        ? ApplicationStatus.APPROVED
        : ApplicationStatus.REJECTED;
    application.reviewedBy = reviewerId;
    application.reviewedAt = new Date();
    application.rejectionReason = body.rejectionReason || null;

    const saved = await this.applicationRepository.save(application);

    return {
      success: true,
      message: `Application ${body.decision.toLowerCase()}d successfully`,
      data: saved,
    };
  }

  async isEditable(id: string): Promise<boolean> {
    const application = await this.applicationRepository.findOne({ where: { id } });
    return application?.status === ApplicationStatus.PENDING;
  }

  async ensureEditable(id: string): Promise<ApplicationEntity> {
    const application = await this.applicationRepository.findOne({ where: { id } });
    if (!application || application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Application is not in PENDING status');
    }
    return application;
  }

  async getApplicationForStudentModification(
    appId: string,
    currentUser: { role: string; universityId?: string },
  ) {
    const application = await this.applicationRepository.findOne({
      where: { id: appId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (
      currentUser.role === UserRole.UNIVERSITY &&
      application.universityId !== currentUser.universityId
    ) {
      throw new ForbiddenException('You do not have permission to modify this application');
    }

    return application;
  }
}
