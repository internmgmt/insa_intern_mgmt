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

  async create(createSubmissionDto: any) {
    const { studentId } = createSubmissionDto;
    if (studentId) {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
      });
      if (!student) {
        throw new NotFoundException({
          success: false,
          message: 'Student not found',
          error: { code: 'STUDENT_NOT_FOUND', details: null },
        });
      }
    }

    const submission = this.submissionRepository.create(createSubmissionDto);
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

    Object.assign(submission, updateSubmissionDto);
    const updated = await this.submissionRepository.save(submission);

    return {
      success: true,
      message: 'Submission updated successfully',
      data: updated,
    };
  }

  async list(query?: { page?: number; limit?: number }) {
    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = 100; // Enforce strict 100 limit as requested

    const [items, totalItems] = await this.submissionRepository.findAndCount({
      relations: ['student'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

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
      submission.status !== SubmissionStatus.UNDER_REVIEW
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

    if (decision === 'APPROVE') {
      submission.status = SubmissionStatus.APPROVED;
      submission.rejectionReason = null;
    } else {
      submission.status = SubmissionStatus.REJECTED;
      submission.rejectionReason = rejectionReason ?? null;
    }

    const saved = await this.submissionRepository.save(submission);

    return {
      success: true,
      message: 'Submission reviewed successfully',
      data: saved,
    };
  }
}
