import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UniversityEntity } from '../entities/university.entity';
import { ApplicationEntity } from '../entities/application.entity';
import { StudentEntity } from '../entities/student.entity';
import { InternEntity } from '../entities/intern.entity';
import { SubmissionEntity } from '../entities/submission.entity';
import { DepartmentEntity } from '../entities/department.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(UniversityEntity) private readonly universities: Repository<UniversityEntity>,
    @InjectRepository(ApplicationEntity) private readonly applications: Repository<ApplicationEntity>,
    @InjectRepository(StudentEntity) private readonly students: Repository<StudentEntity>,
    @InjectRepository(InternEntity) private readonly interns: Repository<InternEntity>,
    @InjectRepository(SubmissionEntity) private readonly submissions: Repository<SubmissionEntity>,
    @InjectRepository(DepartmentEntity) private readonly departments: Repository<DepartmentEntity>,
  ) { }

  async getSummary(user: any) {
    if (user.role === UserRole.ADMIN) {
      return this.adminSummary();
    }

    if (user.role === UserRole.SUPERVISOR) {
      const deptId = user.departmentId;

      const [internsCount, activeInternsCount, pendingSubmissions, mentorsCount] = await Promise.all([
        this.interns.count({ where: { departmentId: deptId } }),
        this.interns.count({ where: { departmentId: deptId, status: 'ACTIVE' } }),
        this.submissions.createQueryBuilder('s')
          .innerJoin('s.intern', 'i')
          .where('i.departmentId = :deptId', { deptId })
          .andWhere('s.status = :status', { status: 'SUBMITTED' })
          .getCount(),
        this.users.count({ where: { departmentId: deptId, role: UserRole.MENTOR } })
      ]);

      return {
        success: true,
        data: {
          internsCount,
          activeInternsCount,
          pendingSubmissions,
          mentorsCount
        }
      };
    }

    if (user.role === UserRole.MENTOR) {
      const mentorId = user.id;

      const [internsCount, pendingReviews, activeTasks] = await Promise.all([
        this.interns.count({ where: { assignedMentorId: mentorId } }),
        this.submissions.createQueryBuilder('s')
          .innerJoin('s.intern', 'i')
          .where('i.assignedMentorId = :mentorId', { mentorId })
          .andWhere('s.status = :status', { status: 'SUBMITTED' })
          .getCount(),
        this.submissions.createQueryBuilder('s')
          .innerJoin('s.intern', 'i')
          .where('i.assignedMentorId = :mentorId', { mentorId })
          .andWhere('s.status = :status', { status: 'ASSIGNED' })
          .getCount()
      ]);

      return {
        success: true,
        data: {
          internsCount,
          pendingReviews,
          activeTasks
        }
      };
    }

    return { success: false, message: 'No summary for this role' };
  }

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
    const [appStatuses, studentStatuses, submissionStatuses] = await Promise.all([
      this.applications.createQueryBuilder('a').select('a.status', 'status').addSelect('COUNT(*)', 'count').groupBy('a.status').getRawMany(),
      this.students.createQueryBuilder('s').select('s.status', 'status').addSelect('COUNT(*)', 'count').groupBy('s.status').getRawMany(),
      this.submissions.createQueryBuilder('sub').select('sub.status', 'status').addSelect('COUNT(*)', 'count').groupBy('sub.status').getRawMany(),
    ]);

    // Interns by department with names
    const internsByDept = await this.interns
      .createQueryBuilder('i')
      .select('d.name', 'departmentName')
      .addSelect('COUNT(*)', 'count')
      .leftJoin('departments', 'd', 'd.id = i.departmentId')
      .groupBy('d.name')
      .getRawMany();

    // Top 5 Universities by total student count in applications
    const topUniversities = await this.universities
      .createQueryBuilder('u')
      .leftJoin('u.applications', 'a')
      .leftJoin('a.students', 's')
      .select('u.name', 'name')
      .addSelect('COUNT(s.id)', 'count')
      .groupBy('u.id')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();

    // Field of Study Distribution (top 10)
    const fieldOfStudyDistribution = await this.students
      .createQueryBuilder('s')
      .select('s.fieldOfStudy', 'field')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.fieldOfStudy')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Applications trend (last 6 months)
    const applicationsTrend = await this.applications
      .createQueryBuilder('a')
      .select("to_char(a.created_at, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where("a.created_at >= NOW() - INTERVAL '6 months'")
      .groupBy("to_char(a.created_at, 'YYYY-MM')")
      .orderBy("to_char(a.created_at, 'YYYY-MM')", 'ASC')
      .getRawMany();

    // Submissions trend (last 6 months)
    const submissionsTrend = await this.submissions
      .createQueryBuilder('sub')
      .select("to_char(sub.created_at, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where("sub.created_at >= NOW() - INTERVAL '6 months'")
      .groupBy("to_char(sub.created_at, 'YYYY-MM')")
      .orderBy("to_char(sub.created_at, 'YYYY-MM')", 'ASC')
      .getRawMany();

    // Placement Rate: Interns / (Interns + Students)
    const totalPotential = interns + students;
    const placementRate = totalPotential > 0 ? Math.round((interns / totalPotential) * 100) : 0;

    return {
      success: true,
      message: 'Enhanced admin dashboard summary',
      data: {
        counts: { users, universities, applications, students, interns, submissions },
        distributions: {
          applications: appStatuses,
          students: studentStatuses,
          submissions: submissionStatuses,
          fields: fieldOfStudyDistribution,
        },
        internsByDept,
        topUniversities,
        applicationsTrend,
        submissionsTrend,
        metrics: {
          placementRate,
          activeProjects: 12,
          averageSubmissionScore: 85,
        }
      },
    };
  }
}
