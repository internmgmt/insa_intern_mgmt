import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UniversityEntity } from '../entities/university.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { StudentEntity } from '../entities/student.entity';
import { InternEntity } from '../entities/intern.entity';
import { SubmissionEntity } from '../entities/submission.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(UniversityEntity) private readonly universities: Repository<UniversityEntity>,
    @InjectRepository(ApplicationEntity) private readonly applications: Repository<ApplicationEntity>,
    @InjectRepository(StudentEntity) private readonly students: Repository<StudentEntity>,
    @InjectRepository(InternEntity) private readonly interns: Repository<InternEntity>,
    @InjectRepository(SubmissionEntity) private readonly submissions: Repository<SubmissionEntity>,
  ) {}

  async adminSummary() {
    const [users, universities, applications, students, interns, submissions] = await Promise.all([
      this.users.count(),
      this.universities.count(),
      this.applications.count(),
      this.students.count(),
      this.interns.count(),
      this.submissions.count(),
    ]);

    // Status distributions
    const appStatuses = await this.applications
      .createQueryBuilder('a')
      .select('a.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('a.status')
      .getRawMany();
    const studentStatuses = await this.students
      .createQueryBuilder('s')
      .select('s.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.status')
      .getRawMany();
    const submissionStatuses = await this.submissions
      .createQueryBuilder('sub')
      .select('sub.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sub.status')
      .getRawMany();

    // Interns by department
    const internsByDept = await this.interns
      .createQueryBuilder('i')
      .select('i.department_id', 'departmentId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('i.department_id')
      .getRawMany();

    // Submissions per day (last 30 days)
    const submissionsTrend = await this.submissions
      .createQueryBuilder('sub')
      .select("to_char(sub.created_at, 'YYYY-MM-DD')", 'day')
      .addSelect('COUNT(*)', 'count')
      .where("sub.created_at >= NOW() - INTERVAL '30 days'")
      .groupBy("to_char(sub.created_at, 'YYYY-MM-DD')")
      .orderBy("to_char(sub.created_at, 'YYYY-MM-DD')", 'ASC')
      .getRawMany();

    return {
      success: true,
      message: 'Admin dashboard summary',
      data: {
        counts: { users, universities, applications, students, interns, submissions },
        distributions: {
          applications: appStatuses,
          students: studentStatuses,
          submissions: submissionStatuses,
        },
        internsByDept,
        submissionsTrend,
      },
    };
  }
}
