import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { DepartmentEntity } from '../entities/department.entity';
import { UserEntity, UserRole } from '../entities/user.entity';
import { InternEntity } from '../entities/intern.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryInternsDto } from './dto/query-interns.dto';
import {
  ensureDepartmentNameUnique,
  validateDepartmentType,
} from './department.validators';
import {
  DEPARTMENT_NOT_FOUND,
  DEPARTMENT_NAME_EXISTS,
} from '../common/filters/http-exception.filter';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(DepartmentEntity)
    private readonly departmentRepository: Repository<DepartmentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(InternEntity)
    private readonly internRepository: Repository<InternEntity>,
  ) { }

  async findAll() {
    const departments = await this.departmentRepository.find({
      order: { name: 'ASC' },
    });

    const items = await Promise.all(
      departments.map(async (dept) => {
        // Get intern count
        const internCount = await this.internRepository.count({
          where: { departmentId: dept.id },
        });

        // Get supervisors to find a "Head"
        const supervisors = await this.userRepository.find({
          where: {
            departmentId: dept.id,
            role: UserRole.SUPERVISOR,
          },
          order: { createdAt: 'ASC' },
          take: 1,
        });

        const head = supervisors.length > 0 
          ? `${supervisors[0].firstName} ${supervisors[0].lastName}`
          : 'Not Assigned';

        return {
          ...dept,
          internCount,
          head,
        };
      }),
    );

    return {
      success: true,
      message: 'Departments retrieved successfully',
      data: {
        items,
      },
    };
  }

  async create(createDepartmentDto: CreateDepartmentDto) {
    const { name, type, description } = createDepartmentDto;
    validateDepartmentType(type);
    await ensureDepartmentNameUnique(this.departmentRepository, name);

    const department = this.departmentRepository.create({
      name,
      type,
      description,
    });

    const saved = await this.departmentRepository.save(department);

    return {
      success: true,
      message: 'Department created successfully',
      data: saved,
    };
  }

  /**
   * Get department by ID with supervisors relation
   */
  async getById(id: string) {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['supervisors'],
    });

    if (!department) {
      throw new NotFoundException({
        success: false,
        message: 'Department not found',
        error: { code: DEPARTMENT_NOT_FOUND, details: null },
      });
    }

    return {
      success: true,
      message: 'Department retrieved successfully',
      data: {
        id: department.id,
        name: department.name,
        type: department.type,
        description: department.description,
        createdAt: department.createdAt,
        updatedAt: department.updatedAt,
        supervisors:
          department.supervisors?.map((s) => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            email: s.email,
          })) ?? [],
      },
    };
  }

  /**
   * Update department - only name and description can be updated, type is immutable
   */
  async update(id: string, updateDepartmentDto: UpdateDepartmentDto) {
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException({
        success: false,
        message: 'Department not found',
        error: { code: DEPARTMENT_NOT_FOUND, details: null },
      });
    }

    // If name is being updated, check uniqueness (exclude self)
    if (
      updateDepartmentDto.name &&
      updateDepartmentDto.name !== department.name
    ) {
      const existing = await this.departmentRepository.findOne({
        where: { name: updateDepartmentDto.name, id: Not(id) },
      });

      if (existing) {
        throw new ConflictException({
          success: false,
          message: 'A department with this name already exists',
          error: { code: DEPARTMENT_NAME_EXISTS, details: null },
        });
      }
    }

    // Only update name and description (type is explicitly excluded in DTO)
    if (updateDepartmentDto.name !== undefined) {
      department.name = updateDepartmentDto.name;
    }
    if (updateDepartmentDto.description !== undefined) {
      department.description = updateDepartmentDto.description;
    }

    const saved = await this.departmentRepository.save(department);

    return {
      success: true,
      message: 'Department updated successfully',
      data: {
        id: saved.id,
        name: saved.name,
        type: saved.type,
        description: saved.description,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      },
    };
  }

  /**
   * Get paginated interns for a department with optional filters
   */
  async getDepartmentInterns(id: string, query: QueryInternsDto) {
    // Verify department exists
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException({
        success: false,
        message: 'Department not found',
        error: { code: DEPARTMENT_NOT_FOUND, details: null },
      });
    }

    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = 100; // Enforce strict 100 limit as requested

    const qb = this.internRepository
      .createQueryBuilder('intern')
      .leftJoinAndSelect('intern.supervisor', 'supervisor')
      .leftJoinAndSelect('intern.student', 'student')
      .where('intern.departmentId = :departmentId', { departmentId: id });

    // Filter by status
    if (query?.status) {
      qb.andWhere('intern.status = :status', { status: query.status });
    }

    // Filter by supervisor
    if (query?.supervisorId) {
      qb.andWhere('intern.assignedSupervisorId = :supervisorId', {
        supervisorId: query.supervisorId,
      });
    }

    qb.orderBy('intern.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      success: true,
      message: 'Department interns retrieved successfully',
      data: {
        items: items.map((intern) => ({
          id: intern.id,
          internId: intern.internId,
          status: intern.status,
          startDate: intern.startDate,
          endDate: intern.endDate,
          isActive: intern.isActive,
          supervisor: intern.supervisor
            ? {
              id: intern.supervisor.id,
              firstName: intern.supervisor.firstName,
              lastName: intern.supervisor.lastName,
            }
            : null,
          student: intern.student
            ? {
              id: intern.student.id,
              firstName: intern.student.firstName,
              lastName: intern.student.lastName,
              studentId: intern.student.studentId,
            }
            : null,
        })),
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    };
  }

  /**
   * Get supervisors for a department with intern counts
   */
  async getDepartmentSupervisors(id: string) {
    // Verify department exists
    const department = await this.departmentRepository.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException({
        success: false,
        message: 'Department not found',
        error: { code: DEPARTMENT_NOT_FOUND, details: null },
      });
    }

    // Get supervisors in this department
    const supervisors = await this.userRepository.find({
      where: {
        departmentId: id,
        role: UserRole.SUPERVISOR,
      },
      order: { lastName: 'ASC', firstName: 'ASC' },
    });

    // Get intern counts per supervisor
    const supervisorData = await Promise.all(
      supervisors.map(async (supervisor) => {
        const internCount = await this.internRepository.count({
          where: { assignedSupervisorId: supervisor.id },
        });

        return {
          id: supervisor.id,
          firstName: supervisor.firstName,
          lastName: supervisor.lastName,
          email: supervisor.email,
          isActive: supervisor.isActive,
          internCount,
        };
      }),
    );

    return {
      success: true,
      message: 'Department supervisors retrieved successfully',
      data: {
        items: supervisorData,
      },
    };
  }
}
