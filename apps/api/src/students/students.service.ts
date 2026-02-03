import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../entities/student.entity';
import { StudentStatus } from '../common/enums/student-status.enum';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { ensureStudentIdUnique } from '../common/validators/student.validators';
import { ApplicationsService } from '../applications/applications.service';
import { StudentMapper } from './student.mapper';
import { UserRole } from '../common/enums/user-role.enum';
import { MailService } from '../global/services/mail/mail.service';
import {
  STUDENT_ALREADY_REVIEWED,
  STUDENT_NOT_ARRIVED,
} from '../common/filters/http-exception.filter';
import { ApplicationStatus } from '../common/enums/application-status.enum';
import { DocumentEntity } from '../entities/document.entity';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(DocumentEntity)
    private readonly documentRepository: Repository<DocumentEntity>,
    private readonly applicationsService: ApplicationsService,
    private readonly mailService: MailService,
  ) { }

  async addStudent(
    appId: string,
    createStudentDto: CreateStudentDto,
    currentUser: { role: string; universityId?: string },
  ) {
    // Verify ownership and application status (must not be UNDER_REVIEW/APPROVED)
    await this.validateApplicationAccess(appId, currentUser, [
      ApplicationStatus.PENDING,
      ApplicationStatus.REJECTED,
    ]);

    // Check studentId uniqueness
    await ensureStudentIdUnique(
      this.studentRepository,
      createStudentDto.studentId,
    );

    const student = this.studentRepository.create({
      ...createStudentDto,
      applicationId: appId,
      status: StudentStatus.PENDING_REVIEW,
    });

    const saved = await this.studentRepository.save(student);

    // Link CV and Transcript if they exist as documents
    if (createStudentDto.cvUrl) {
      await this.linkDocument(createStudentDto.cvUrl, {
        entityType: 'STUDENT',
        entityId: saved.id,
        studentId: saved.id,
        applicationId: appId,
        documentType: 'CV',
      });
    }
    if (createStudentDto.transcriptUrl) {
      await this.linkDocument(createStudentDto.transcriptUrl, {
        entityType: 'STUDENT',
        entityId: saved.id,
        studentId: saved.id,
        applicationId: appId,
        documentType: 'TRANSCRIPT',
      });
    }

    const loaded = await this.studentRepository.findOne({
      where: { id: saved.id },
      relations: ['application', 'application.university'],
    });

    if (!loaded) {
      throw new NotFoundException('Student not found after creation');
    }

    return {
      success: true,
      message: 'Student added successfully',
      data: StudentMapper.toDetailResponse(loaded),
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
        this.logger.debug(`Linked document ${doc.id} to ${meta.entityType} ${meta.entityId}`);
      }
    } catch (error) {
      this.logger.error('Error linking document:', error);
    }
  }

  /**
   * Add a student by using an explicit applicationId or by resolving the latest editable
   * application for the caller's university.
   */
  async addStudentFlexible(
    appId: string | undefined | null,
    createStudentDto: CreateStudentDto,
    currentUser: { role: string; universityId?: string },
  ) {
    let targetAppId = appId;
    if (!targetAppId) {
      // Must be a university user with an associated university
      if (currentUser.role !== UserRole.UNIVERSITY || !currentUser.universityId) {
        throw new BadRequestException({
          success: false,
          message: 'Unable to determine target application. Provide applicationId or ensure your account is linked to a university.',
          error: { code: 'APPLICATION_NOT_RESOLVABLE', details: null },
        });
      }

      const app = await this.applicationsService.findLatestEditableByUniversity(
        currentUser.universityId,
      );
      if (!app) {
        throw new NotFoundException({
          success: false,
          message: 'No editable application found for your university. Create one first.',
          error: { code: 'APPLICATION_NOT_FOUND', details: null },
        });
      }
      targetAppId = app.id;
    }

    return this.addStudent(targetAppId, createStudentDto, currentUser);
  }

  async updateStudent(
    id: string,
    updateStudentDto: UpdateStudentDto,
    currentUser: { role: string; universityId?: string },
  ) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['application'],
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        message: 'Student not found',
        error: { code: 'STUDENT_NOT_FOUND', details: null },
      });
    }

    // Verify ownership and application status (PENDING or REJECTED only)
    await this.validateApplicationAccess(student.applicationId, currentUser, [
      ApplicationStatus.PENDING,
      ApplicationStatus.REJECTED,
    ]);

    if (
      updateStudentDto.studentId &&
      updateStudentDto.studentId !== student.studentId
    ) {
      throw new BadRequestException({
        success: false,
        message: 'Student ID cannot be modified',
        error: {
          code: 'STUDENT_ID_IMMUTABLE',
          details: null,
        },
      });
    }

    delete updateStudentDto.studentId;

    // Link new documents if updated
    if (updateStudentDto.cvUrl) {
      await this.linkDocument(updateStudentDto.cvUrl, {
        entityType: 'STUDENT',
        entityId: id,
        studentId: id,
        applicationId: student.applicationId,
        documentType: 'CV',
      });
    }
    if (updateStudentDto.transcriptUrl) {
      await this.linkDocument(updateStudentDto.transcriptUrl, {
        entityType: 'STUDENT',
        entityId: id,
        studentId: id,
        applicationId: student.applicationId,
        documentType: 'TRANSCRIPT',
      });
    }

    const fieldsToUpdate = Object.keys(updateStudentDto).filter((key) => {
      const value = (updateStudentDto as any)[key];
      return value !== undefined && value !== null;
    });

    if (fieldsToUpdate.length === 0) {
      const loaded = await this.studentRepository.findOne({
        where: { id: student.id },
        relations: ['application', 'application.university'],
      });

      if (!loaded) {
        throw new NotFoundException('Student not found after lookup');
      }

      return {
        success: true,
        message: 'Student updated successfully',
        data: StudentMapper.toDetailResponse(loaded),
      };
    }

    Object.assign(student, updateStudentDto);
    const saved = await this.studentRepository.save(student);

    const loaded = await this.studentRepository.findOne({
      where: { id: saved.id },
      relations: ['application', 'application.university'],
    });

    if (!loaded) {
      throw new NotFoundException('Student not found after update');
    }

    return {
      success: true,
      message: 'Student updated successfully',
      data: StudentMapper.toDetailResponse(loaded),
    };
  }

  async removeStudent(
    appId: string,
    id: string,
    currentUser: { role: string; universityId?: string },
  ) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['application'],
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        message: 'Student not found',
        error: { code: 'STUDENT_NOT_FOUND', details: null },
      });
    }

    if (student.applicationId !== appId) {
      throw new BadRequestException(
        'Student does not belong to the specified application',
      );
    }

    // Verify ownership and application status (PENDING only)
    await this.validateApplicationAccess(student.applicationId, currentUser, [
      ApplicationStatus.PENDING,
    ]);

    await this.studentRepository.softRemove(student);

    return {
      success: true,
      message: 'Student removed successfully',
      data: null,
    };
  }

  async listAll(
    query: QueryStudentsDto,
    currentUser: { role: string; universityId?: string },
  ) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const requestedLimit =
      query?.limit && query.limit > 0 ? query.limit : 50;
    const limit = Math.min(requestedLimit, 50);

    const qb = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.application', 'application')
      .leftJoinAndSelect('application.university', 'university');

    // Filter by university
    if (query?.universityId) {
      qb.andWhere('application.universityId = :universityId', {
        universityId: query.universityId
      });
    }

    // Filter by academic year (from application)
    if (query?.academicYear) {
      qb.andWhere('application.academicYear = :academicYear', {
        academicYear: query.academicYear
      });
    }

    // Filter by status
    if (query?.status) {
      qb.andWhere('student.status = :status', { status: query.status });
    }

    // Search filter
    const search = query?.search?.toString().trim();
    if (search) {
      qb.andWhere(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.studentId ILIKE :search OR student.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('student.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Students retrieved successfully',
      data: {
        items: items.map((item) => {
          const mapped = StudentMapper.toListResponse(item);
          // Include universityId for admin filtering
          return {
            ...mapped,
            universityId: item.application?.universityId,
          };
        }),
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
  }

  async listByApplication(
    appId: string,
    query: QueryStudentsDto,
    currentUser: { role: string; universityId?: string },
  ) {
    if (currentUser.role === UserRole.UNIVERSITY) {
      const application = await this.applicationsService.findByIdWithoutResponse(appId);
      if (!application || application.universityId !== currentUser.universityId) {
        throw new ForbiddenException({
          success: false,
          message: 'You are not allowed to access this application',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    const page = query?.page && query.page > 0 ? query.page : 1;
    const requestedLimit =
      query?.limit && query.limit > 0 ? query.limit : 50;
    const limit = Math.min(requestedLimit, 50);
    const qb = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.application', 'application')
      .leftJoinAndSelect('application.university', 'university')
      .where('student.applicationId = :appId', { appId });

    if (query?.status) {
      qb.andWhere('student.status = :status', { status: query.status });
    }

    const search = query?.search?.toString().trim();
    if (search) {
      qb.andWhere(
        '(student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.studentId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('student.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Students retrieved successfully',
      data: {
        items: items.map((item) => StudentMapper.toListResponse(item)),
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
  }

  async getById(
    id: string,
    currentUser: { role: string; universityId?: string },
  ) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['application', 'application.university'],
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        message: 'Student not found',
        error: { code: 'STUDENT_NOT_FOUND', details: null },
      });
    }

    if (currentUser.role === UserRole.UNIVERSITY) {
      if (student.application?.university?.id !== currentUser.universityId) {
        throw new ForbiddenException({
          success: false,
          message: 'Access denied',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    return {
      success: true,
      message: 'Student retrieved successfully',
      data: StudentMapper.toDetailResponse(student),
    };
  }

  async reviewStudent(
    id: string,
    decision: 'ACCEPT' | 'REJECT',
    rejectionReason?: string,
  ) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['application', 'application.university'],
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        message: 'Student not found',
        error: { code: 'STUDENT_NOT_FOUND', details: null },
      });
    }

    if (student.status !== StudentStatus.PENDING_REVIEW) {
      throw new BadRequestException({
        success: false,
        message: 'Student has already been reviewed',
        error: { code: STUDENT_ALREADY_REVIEWED, details: null },
      });
    }

    if (decision === 'ACCEPT') {
      student.status = StudentStatus.ACCEPTED;
      student.rejectionReason = null;
    } else {
      student.status = StudentStatus.REJECTED;
      student.rejectionReason = rejectionReason ?? null;
    }

    const saved = await this.studentRepository.save(student);

    if (decision === 'REJECT' && student.email) {
      try {
        const universityName = student.application?.university?.name || 'INSA';
        const supportEmail =
          student.application?.university?.contactEmail ||
          'support@insa.gov.et';

        await this.mailService.sendStudentRejectionEmail(
          student.email,
          student.firstName,
          universityName,
          rejectionReason ||
          'Your application did not meet the selection criteria.',
          supportEmail,
        );
      } catch (error) {
        this.logger.error('Failed to send student rejection email', error);
      }
    }

    return {
      success: true,
      message: 'Student reviewed successfully',
      data: StudentMapper.toDetailResponse(saved),
    };
  }

  async markArrived(id: string, notes?: string) {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['application', 'application.university'],
    });

    if (!student) {
      throw new NotFoundException({
        success: false,
        message: 'Student not found',
        error: { code: 'STUDENT_NOT_FOUND', details: null },
      });
    }

    if (student.status !== StudentStatus.AWAITING_ARRIVAL) {
      throw new BadRequestException({
        success: false,
        message: `Student cannot be marked as arrived. Current status is ${student.status}. Only students with AWAITING_ARRIVAL status can be marked as arrived.`,
        error: { code: STUDENT_NOT_ARRIVED, details: null },
      });
    }

    student.status = StudentStatus.ARRIVED;

    const saved = await this.studentRepository.save(student);

    if (notes) {
      this.logger.log(
        `[AUDIT] Student ${id} marked as arrived. Notes: ${notes}`,
      );
    }

    return {
      success: true,
      message: 'Student marked as arrived successfully',
      data: StudentMapper.toDetailResponse(saved),
    };
  }

  private async validateApplicationAccess(
    appId: string,
    currentUser: { role: string; universityId?: string },
    allowedStatuses: ApplicationStatus[],
  ) {
    const application =
      await this.applicationsService.findByIdWithoutResponse(appId);

    if (!application) {
      throw new NotFoundException({
        success: false,
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', details: null },
      });
    }

    if (
      currentUser.role === UserRole.UNIVERSITY &&
      application.universityId !== currentUser.universityId
    ) {
      throw new ForbiddenException({
        success: false,
        message: 'You act on behalf of another university',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }

    if (!allowedStatuses.includes(application.status)) {
      throw new BadRequestException({
        success: false,
        message: 'Application is not editable in current status',
        error: {
          code: 'APPLICATION_NOT_EDITABLE',
          details: { status: application.status },
        },
      });
    }

    return application;
  }
}
