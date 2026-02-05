import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { StudentEntity } from '../entities/student.entity';
import { InternEntity } from '../entities/intern.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { StudentStatus } from '../common/enums/student-status.enum';
import { InternStatus } from '../common/enums/intern-status.enum';
import { QueryInternsDto } from './dto/query-interns.dto';
import { UpdateInternDto } from './dto/update-intern.dto';
import { CompleteInternDto } from './dto/complete-intern.dto';
import { TerminateInternDto } from './dto/terminate-intern.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { SuspendInternDto } from './dto/suspend-intern.dto';
import { InternMapper } from './intern.mapper';
import { MailService } from '../global/services/mail/mail.service';
import {
  AUTH_INSUFFICIENT_PERMISSIONS,
  INTERN_NOT_ACTIVE,
  INTERN_NOT_COMPLETED,
  CERTIFICATE_ALREADY_ISSUED,
  INVALID_CERTIFICATE_URL,
} from '../common/filters/http-exception.filter';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class InternsService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
    @InjectRepository(InternEntity)
    private readonly internRepository: Repository<InternEntity>,
    private readonly mailService: MailService,
  ) { }

  async list(query: QueryInternsDto, currentUser: any) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const requestedLimit =
      query?.limit && query.limit > 0 ? query.limit : 50;
    const limit = Math.min(requestedLimit, 50);

    const qb = this.internRepository
      .createQueryBuilder('intern')
      .leftJoinAndSelect('intern.student', 'student')
      .leftJoinAndSelect('intern.user', 'user')
      .leftJoinAndSelect('intern.department', 'department')
      .leftJoinAndSelect('intern.supervisor', 'supervisor')
      .leftJoinAndSelect('student.application', 'application')
      .leftJoinAndSelect('application.university', 'university')
      .leftJoin('intern.submissions', 'submission')
      .addSelect('COUNT(submission.id)', 'submissionCount')
      .groupBy('intern.id')
      .addGroupBy('student.id')
      .addGroupBy('user.id')
      .addGroupBy('department.id')
      .addGroupBy('supervisor.id')
      .addGroupBy('application.id')
      .addGroupBy('university.id');

    if (currentUser?.role === UserRole.SUPERVISOR) {
      if (
        query?.departmentId &&
        query.departmentId !== currentUser.departmentId
      ) {
        throw new ForbiddenException({
          success: false,
          message: 'You can only access interns in your own department',
          error: { code: AUTH_INSUFFICIENT_PERMISSIONS, details: null },
        });
      }
      qb.andWhere('intern.departmentId = :deptId', {
        deptId: currentUser.departmentId,
      });
    }

    if (query?.status) {
      qb.andWhere('intern.status = :status', { status: query.status });
    }

    if (query?.departmentId) {
      qb.andWhere('intern.departmentId = :departmentId', {
        departmentId: query.departmentId,
      });
    }

    if (query?.supervisorId) {
      qb.andWhere('intern.assignedSupervisorId = :supervisorId', {
        supervisorId: query.supervisorId,
      });
    }

    if (query?.startDateFrom) {
      qb.andWhere('intern.startDate >= :startFrom', {
        startFrom: new Date(query.startDateFrom),
      });
    }

    if (query?.startDateTo) {
      qb.andWhere('intern.startDate <= :startTo', {
        startTo: new Date(query.startDateTo),
      });
    }

    const search = query?.search?.toString().trim();
    if (search) {
      qb.andWhere(
        '(LOWER(user.firstName) ILIKE :search OR LOWER(user.lastName) ILIKE :search OR LOWER(intern.internId) ILIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    qb.orderBy('intern.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    const mapped = items.map((intern: any) =>
      InternMapper.toListResponse({
        ...intern,
        submissionCount: (intern as any).submissionCount
          ? Number((intern as any).submissionCount)
          : 0,
      } as any),
    );

    return {
      success: true,
      message: 'Interns retrieved successfully',
      data: {
        items: mapped,
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
  }

  async getById(id: string, currentUser: any) {
    const intern = await this.internRepository.findOne({
      where: { id },
      relations: ['student', 'user', 'department', 'supervisor', 'submissions'],
    });

    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    if (currentUser?.role === UserRole.SUPERVISOR) {
      if (intern.departmentId !== currentUser.departmentId) {
        throw new ForbiddenException({
          success: false,
          message: 'You can only access interns in your own department',
          error: { code: AUTH_INSUFFICIENT_PERMISSIONS, details: null },
        });
      }
    }

    if (currentUser?.role === UserRole.INTERN) {
      if (intern.userId !== currentUser.id) {
        throw new ForbiddenException({
          success: false,
          message: 'You can only access your own profile',
          error: { code: AUTH_INSUFFICIENT_PERMISSIONS, details: null },
        });
      }
    }

    return {
      success: true,
      message: 'Intern retrieved successfully',
      data: InternMapper.toDetailResponse(intern),
    };
  }

  async getMyProfile(currentUser: any) {
    const intern = await this.internRepository.findOne({
      where: { userId: currentUser.id },
      relations: ['student', 'user', 'department', 'supervisor', 'submissions'],
    });

    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    intern.submissions = (intern.submissions || [])
      .sort(
        (a, b) =>
          (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0),
      )
      .slice(0, 5);

    return {
      success: true,
      message: 'Intern profile retrieved successfully',
      data: InternMapper.toProfileResponse(intern),
    };
  }

  async update(id: string, dto: UpdateInternDto, currentUser: any) {
    const intern = await this.internRepository.findOne({
      where: { id },
      relations: ['user', 'student'],
    });

    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    if (currentUser?.role === UserRole.INTERN) {
      const { skills, ...rest } = dto;
      if (Object.keys(rest).some((k) => (dto as any)[k] !== undefined)) {
        throw new ForbiddenException({
          success: false,
          message: 'Interns can only update skills',
          error: { code: AUTH_INSUFFICIENT_PERMISSIONS, details: null },
        });
      }
      intern.skills = skills ?? intern.skills ?? [];
    } else if (currentUser?.role === UserRole.ADMIN) {
      if (dto.finalEvaluation !== undefined) {
        if (dto.finalEvaluation < 0 || dto.finalEvaluation > 4) {
          throw new BadRequestException({
            success: false,
            message: 'finalEvaluation must be between 0.00 and 4.00',
            error: { code: 'BAD_REQUEST', details: null },
          });
        }
      }

      if (
        dto.interviewNotes !== undefined &&
        dto.interviewNotes.length > 2000
      ) {
        throw new BadRequestException({
          success: false,
          message: 'interviewNotes cannot exceed 2000 characters',
          error: { code: 'BAD_REQUEST', details: null },
        });
      }

      if (dto.departmentId !== undefined) {
        intern.departmentId = dto.departmentId;
      }
      if (dto.supervisorId !== undefined) {
        intern.assignedSupervisorId = dto.supervisorId;
      }
      if (dto.startDate !== undefined) {
        intern.startDate = dto.startDate ? new Date(dto.startDate) : null;
      }
      if (dto.endDate !== undefined) {
        intern.endDate = dto.endDate ? new Date(dto.endDate) : null;
      }
      if (dto.skills !== undefined) {
        intern.skills = dto.skills;
      }
      if (dto.interviewNotes !== undefined) {
        (intern as any).interviewNotes = dto.interviewNotes;
      }
      if (dto.finalEvaluation !== undefined) {
        (intern as any).finalEvaluation = dto.finalEvaluation;
      }
    } else {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: AUTH_INSUFFICIENT_PERMISSIONS, details: null },
      });
    }

    const saved = await this.internRepository.save(intern);

    const reloaded = await this.internRepository.findOne({
      where: { id: saved.id },
      relations: ['student', 'user', 'department', 'supervisor', 'submissions'],
    });

    return {
      success: true,
      message: 'Intern updated successfully',
      data: InternMapper.toDetailResponse(reloaded as InternEntity),
    };
  }

  async complete(id: string, dto: CompleteInternDto) {
    const intern = await this.internRepository.findOne({
      where: { id },
      relations: ['user', 'student'],
    });

    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    if (intern.status !== InternStatus.ACTIVE) {
      throw new BadRequestException({
        success: false,
        message: 'Intern must be ACTIVE to complete',
        error: { code: INTERN_NOT_ACTIVE, details: null },
      });
    }

    if (dto.finalEvaluation < 0 || dto.finalEvaluation > 4) {
      throw new BadRequestException({
        success: false,
        message: 'finalEvaluation must be between 0.00 and 4.00',
        error: { code: 'BAD_REQUEST', details: null },
      });
    }

    intern.status = InternStatus.COMPLETED;
    (intern as any).finalEvaluation = dto.finalEvaluation;
    (intern as any).completionNotes = dto.completionNotes ?? null;

    const saved = await this.internRepository.save(intern);

    const reloaded = await this.internRepository.findOne({
      where: { id: saved.id },
      relations: ['student', 'user', 'department', 'supervisor', 'submissions'],
    });

    return {
      success: true,
      message: 'Intern marked as completed',
      data: InternMapper.toDetailResponse(reloaded as InternEntity),
    };
  }

  async terminate(id: string, dto: TerminateInternDto) {
    const intern = await this.internRepository.findOne({
      where: { id },
      relations: ['user', 'student'],
    });

    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    if (intern.status === InternStatus.TERMINATED) {
      throw new BadRequestException({
        success: false,
        message: 'Intern already terminated',
        error: { code: 'BAD_REQUEST', details: null },
      });
    }

    intern.status = InternStatus.TERMINATED;
    intern.isActive = false;
    (intern as any).terminationReason = dto.reason;
    await this.internRepository.save(intern);

    if (intern.userId) {
      await this.userRepository.update(
        { id: intern.userId },
        { isActive: false },
      );
    }

    const reloaded = await this.internRepository.findOne({
      where: { id: intern.id },
      relations: ['student', 'user', 'department', 'supervisor', 'submissions'],
    });

    return {
      success: true,
      message: 'Intern terminated successfully',
      data: InternMapper.toDetailResponse(reloaded as InternEntity),
    };
  }

  async suspend(id: string, dto: SuspendInternDto) {
    const intern = await this.internRepository.findOne({
      where: { id },
    });

    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    intern.isSuspended = true;
    intern.suspensionReason = dto.reason;
    await this.internRepository.save(intern);

    return {
      success: true,
      message: 'Intern suspended successfully',
      data: intern,
    };
  }

  async unsuspend(id: string) {
    const intern = await this.internRepository.findOne({
      where: { id },
    });

    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    intern.isSuspended = false;
    intern.suspensionReason = null;
    await this.internRepository.save(intern);

    return {
      success: true,
      message: 'Intern unsuspended successfully',
      data: intern,
    };
  }

  async issueCertificate(id: string, dto: IssueCertificateDto) {
    const intern = await this.internRepository.findOne({
      where: { id },
      relations: ['student', 'user', 'department', 'supervisor'],
    });

    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    if (intern.status !== InternStatus.COMPLETED) {
      throw new BadRequestException({
        success: false,
        message: 'Intern must be COMPLETED to issue certificate',
        error: { code: INTERN_NOT_COMPLETED, details: null },
      });
    }

    if ((intern as any).certificateIssued) {
      throw new BadRequestException({
        success: false,
        message: 'Certificate already issued',
        error: { code: CERTIFICATE_ALREADY_ISSUED, details: null },
      });
    }

    if (!this.isValidUrl(dto.certificateUrl)) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid certificate URL',
        error: { code: INVALID_CERTIFICATE_URL, details: null },
      });
    }

    (intern as any).certificateUrl = dto.certificateUrl;
    (intern as any).certificateIssued = true;

    const saved = await this.internRepository.save(intern);

    const reloaded = await this.internRepository.findOne({
      where: { id: saved.id },
      relations: ['student', 'user', 'department', 'supervisor', 'submissions'],
    });

    return {
      success: true,
      message: 'Certificate issued successfully',
      data: InternMapper.toDetailResponse(reloaded as InternEntity),
    };
  }

  async createInternFromStudent(
    studentId: string,
    options: {
      supervisorId?: string;
      departmentId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const { supervisorId, departmentId, startDate, endDate } = options;
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['application'],
    });
    if (!student) {
      throw new NotFoundException({
        success: false,
        message: 'Student not found',
        error: { code: 'STUDENT_NOT_FOUND', details: null },
      });
    }

    if (!student.email) {
      throw new BadRequestException({
        success: false,
        message: 'Student does not have an email to create a user account',
        error: { code: 'STUDENT_NO_EMAIL', details: null },
      });
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: student.email },
    });
    if (existingUser) {
      throw new ConflictException({
        success: false,
        message: 'User already exists for this student',
        error: { code: 'USER_EXISTS_FOR_STUDENT', details: null },
      });
    }

    const internId = this.generateInternId(student.academicYear);
    const temporaryPassword = this.generateTemporaryPassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const userPayload: Partial<UserEntity> = {
      email: student.email,
      firstName: student.firstName,
      lastName: student.lastName,
      passwordHash,
      role: UserRole.INTERN,
      isActive: true,
      isFirstLogin: true,
      departmentId: departmentId ?? null,
    };

    let supervisorName: string | undefined;

    if (supervisorId) {
      const supervisor = await this.userRepository.findOne({
        where: { id: supervisorId },
      });
      if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
        throw new BadRequestException({
          success: false,
          message: 'Invalid supervisor',
          error: { code: 'INVALID_SUPERVISOR', details: null },
        });
      }
      userPayload.departmentId = supervisor.departmentId ?? userPayload.departmentId;
      (userPayload as any).supervisorId = supervisor.id;
      supervisorName = `${supervisor.firstName} ${supervisor.lastName}`;
    }

    const user = this.userRepository.create(userPayload as any);
    const savedUser = (await this.userRepository.save(
      user,
    )) as unknown as UserEntity;

    const internPayload: Partial<InternEntity> = {
      userId: savedUser.id,
      studentId: student.id,
      internId,
      status: InternStatus.ACTIVE,
      isActive: true,
      departmentId: (userPayload as any).departmentId ?? null,
      assignedSupervisorId: (userPayload as any).supervisorId ?? null,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
    };
    const intern = this.internRepository.create(internPayload as any);
    const savedIntern = (await this.internRepository.save(
      intern,
    )) as unknown as InternEntity;

    student.status = StudentStatus.ACCOUNT_CREATED;
    await this.studentRepository.save(student);

    // Send email to the intern
    try {
      await this.mailService.sendInternCreatedEmail({
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        internId,
        temporaryPassword,
        startDate: startDate ? startDate.toLocaleDateString() : undefined,
        supervisorName,
      });
    } catch (error) {
      // Log error but don't fail the whole process
      console.error('Failed to send intern welcome email:', error);
    }

    return {
      success: true,
      message: 'Intern account created from student successfully',
      data: {
        id: savedIntern.id,
        internId: savedIntern.internId,
        email: savedUser.email,
        temporaryPassword,
      },
    };
  }

  async assignSupervisor(internId: string, supervisorId: string) {
    const intern = await this.internRepository.findOne({
      where: { id: internId },
      relations: ['user'],
    });
    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    const supervisor = await this.userRepository.findOne({
      where: { id: supervisorId },
    });
    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new NotFoundException({
        success: false,
        message: 'Supervisor not found',
        error: { code: 'SUPERVISOR_NOT_FOUND', details: null },
      });
    }

    (intern as any).departmentId = supervisor.departmentId ?? null;
    intern.assignedSupervisorId = supervisor.id;
    const saved = await this.internRepository.save(intern);

    return {
      success: true,
      message: 'Supervisor assigned to intern',
      data: {
        id: saved.id,
        supervisorId: supervisor.id,
        departmentId: (saved as any).departmentId ?? null,
      },
    };
  }

  async markArrived(internId: string) {
    const intern = await this.internRepository.findOne({
      where: { id: internId },
      relations: ['user'],
    });
    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    const student = intern.studentId
      ? await this.studentRepository.findOne({
        where: { id: intern.studentId },
      })
      : intern.user?.email
        ? await this.studentRepository.findOne({
          where: { email: intern.user.email },
        })
        : null;

    if (!student) {
      throw new NotFoundException({
        success: false,
        message: 'Linked student record not found',
        error: { code: 'STUDENT_NOT_FOUND', details: null },
      });
    }

    student.status = StudentStatus.ARRIVED;
    const saved = await this.studentRepository.save(student);

    return {
      success: true,
      message: 'Intern marked as arrived',
      data: { studentId: saved.id, status: saved.status },
    };
  }

  async markCompleted(internId: string) {
    const intern = await this.internRepository.findOne({
      where: { id: internId },
      relations: ['user'],
    });
    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    const student = intern.studentId
      ? await this.studentRepository.findOne({
        where: { id: intern.studentId },
      })
      : intern.user?.email
        ? await this.studentRepository.findOne({
          where: { email: intern.user.email },
        })
        : null;

    if (!student) {
      throw new NotFoundException({
        success: false,
        message: 'Linked student record not found',
        error: { code: 'STUDENT_NOT_FOUND', details: null },
      });
    }

    student.status = StudentStatus.ACCEPTED;
    const saved = await this.studentRepository.save(student);

    return {
      success: true,
      message: 'Intern marked as completed',
      data: { studentId: saved.id, status: saved.status },
    };
  }

  async terminateIntern(internId: string, reason?: string) {
    const intern = await this.internRepository.findOne({
      where: { id: internId },
      relations: ['user'],
    });
    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    intern.isActive = false;
    (intern as any).terminationReason = reason ?? null;
    await this.internRepository.save(intern);

    const student = intern.studentId
      ? await this.studentRepository.findOne({
        where: { id: intern.studentId },
      })
      : intern.user?.email
        ? await this.studentRepository.findOne({
          where: { email: intern.user.email },
        })
        : null;

    if (student) {
      student.status = StudentStatus.REJECTED;
      student.rejectionReason = reason ?? null;
      await this.studentRepository.save(student);
    }

    return {
      success: true,
      message: 'Intern terminated',
      data: { id: intern.id, isActive: intern.isActive },
    };
  }

  async delete(id: string) {
    const intern = await this.internRepository.findOne({ where: { id } });
    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    await this.internRepository.delete(id);

    return {
      success: true,
      message: 'Intern deleted successfully',
      data: { id },
    };
  }

  generateInternId(academicYear?: string) {
    const year = academicYear
      ? academicYear.replace(/\D/g, '')
      : new Date().getFullYear().toString();
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `INSA-${year}-${suffix}`;
  }

  private generateTemporaryPassword(): string {
    const length = 12;
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specials = '@$!%*?&';
    const all = upper + lower + numbers + specials;
    let pwd = '';
    pwd += upper.charAt(Math.floor(Math.random() * upper.length));
    pwd += lower.charAt(Math.floor(Math.random() * lower.length));
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pwd += specials.charAt(Math.floor(Math.random() * specials.length));
    for (let i = pwd.length; i < length; i++) {
      pwd += all.charAt(Math.floor(Math.random() * all.length));
    }
    return pwd
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }

  private isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
