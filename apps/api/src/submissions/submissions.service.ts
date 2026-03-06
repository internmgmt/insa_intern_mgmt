import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubmissionEntity,
  SubmissionStatus,
} from '../entities/submission.entity';
import { StudentEntity } from '../entities/student.entity';

@Injectable()
export class SubmissionsService {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly submissionRepository: Repository<SubmissionEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
  ) { }

  async create(createSubmissionDto: any, currentUser?: any) {
    const { studentId, internId } = createSubmissionDto;
    
    // Normalize empty strings to null for UUID fields
    const normalizedDto = { ...createSubmissionDto };
    if (normalizedDto.studentId === '') normalizedDto.studentId = null;
    if (normalizedDto.internId === '') normalizedDto.internId = null;
    if (normalizedDto.assignedBy === '') normalizedDto.assignedBy = null;

    // Map fileUrl to files if present
    if (normalizedDto.fileUrl) {
      normalizedDto.files = normalizedDto.fileUrl;
      delete normalizedDto.fileUrl;
    }

    const submission = this.submissionRepository.create({
      ...normalizedDto,
      status: normalizedDto.status || (normalizedDto.type === 'TASK' ? 'ASSIGNED' : 'SUBMITTED'),
      assignedBy: normalizedDto.assignedBy || (currentUser?.role === 'MENTOR' ? currentUser.id : null),
    });
    
    const saved = await this.submissionRepository.save(submission);

    return {
      success: true,
      message: 'Submission created successfully',
      data: saved,
    };
  }

  async update(id: string, updateSubmissionDto: any) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException({
        success: false,
        message: 'Submission not found',
        error: { code: 'SUBMISSION_NOT_FOUND', details: null },
      });
    }

    // Map fileUrl to files if present
    if (updateSubmissionDto.fileUrl) {
      updateSubmissionDto.files = updateSubmissionDto.fileUrl;
      delete updateSubmissionDto.fileUrl;
    }

    Object.assign(submission, updateSubmissionDto);
    const updated = await this.submissionRepository.save(submission);

    return {
      success: true,
      message: 'Submission updated successfully',
      data: updated,
    };
  }

  async list(query?: { page?: number; limit?: number; status?: string; studentId?: string; userId?: string }, currentUser?: any) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = 100; // Enforce strict 100 limit as requested

    const qb = this.submissionRepository
      .createQueryBuilder('submission')
      .leftJoinAndSelect('submission.student', 'student')
      .leftJoinAndSelect('submission.intern', 'intern')
      .leftJoinAndSelect('intern.user', 'internUser')
      .leftJoinAndSelect('submission.reviewer', 'reviewer')
      .orderBy('submission.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query?.status) {
      qb.andWhere('submission.status = :status', { status: query.status });
    }

    if (query?.studentId && query.studentId !== '') {
      qb.andWhere('submission.studentId = :studentId', { studentId: query.studentId });
    }

    if (query?.userId && query.userId !== '') {
      // Find by intern's userId (for interns)
      qb.andWhere('intern.userId = :userId', { userId: query.userId });
    }

    if (currentUser && !query?.userId && !query?.studentId) { // Only apply role filters if not explicitly searching for a user
      if (currentUser.role === 'SUPERVISOR') {
        qb.andWhere('intern.departmentId = :deptId', {
          deptId: currentUser.departmentId,
        });
      } else if (currentUser.role === 'MENTOR') {
        qb.andWhere('(intern.assignedMentorId = :mentorId OR submission.assignedBy = :mentorId)', {
          mentorId: currentUser.id,
        });
      }
    }

    const [items, totalItems] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Submissions retrieved successfully',
      data: {
        items,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      },
    };
  }

  async findById(id: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!submission) {
      throw new NotFoundException({
        success: false,
        message: 'Submission not found',
        error: { code: 'SUBMISSION_NOT_FOUND', details: null },
      });
    }

    return {
      success: true,
      message: 'Submission retrieved successfully',
      data: submission,
    };
  }

  async reviewSubmission(
    id: string,
    reviewerId: string | null,
    decision: 'APPROVE' | 'REJECT',
    rejectionReason?: string,
    score?: number,
    feedback?: string,
  ) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException({
        success: false,
        message: 'Submission not found',
        error: { code: 'SUBMISSION_NOT_FOUND', details: null },
      });
    }

    if (
      submission.status !== SubmissionStatus.SUBMITTED &&
      submission.status !== SubmissionStatus.UNDER_REVIEW &&
      submission.status !== SubmissionStatus.ASSIGNED
    ) {
      throw new BadRequestException({
        success: false,
        message: 'Submission cannot be reviewed in current status',
        error: {
          code: 'SUBMISSION_INVALID_STATUS',
          details: { status: submission.status },
        },
      });
    }

    submission.reviewedBy = reviewerId ?? null;
    submission.reviewedAt = new Date();
    submission.score = score ?? null;
    submission.feedback = feedback ?? null;

    if (decision === 'APPROVE') {
      submission.status = SubmissionStatus.APPROVED;
      submission.rejectionReason = null;
    } else {
      submission.status = SubmissionStatus.REJECTED;
      submission.rejectionReason = rejectionReason ?? feedback ?? null;
    }

    const saved = await this.submissionRepository.save(submission);

    return {
      success: true,
      message: 'Submission reviewed successfully',
      data: saved,
    };
  }

  async delete(id: string) {
    const submission = await this.submissionRepository.findOne({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException({
        success: false,
        message: 'Submission not found',
        error: { code: 'SUBMISSION_NOT_FOUND', details: null },
      });
    }

    await this.submissionRepository.remove(submission);

    return {
      success: true,
      message: 'Submission deleted successfully',
    };
  }
}
