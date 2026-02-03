import { ConflictException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DepartmentEntity } from '../entities/department.entity';
import { DepartmentType } from '../common/enums/department-type.enum';

export async function ensureDepartmentNameUnique(
  departmentRepository: Repository<DepartmentEntity>,
  name: string,
  excludeId?: string,
): Promise<void> {
  const existing = await departmentRepository.findOne({
    where: { name },
  });

  if (existing && existing.id !== excludeId) {
    throw new ConflictException({
      success: false,
      message: 'Department with this name already exists',
      error: {
        code: 'DEPARTMENT_NAME_EXISTS',
        details: null,
      },
    });
  }
}

export function validateDepartmentType(type: any): void {
  const allowed = Object.values(DepartmentType);
  if (!allowed.includes(type)) {
    throw new BadRequestException({
      success: false,
      message: 'Invalid department type',
      error: {
        code: 'DEPARTMENT_INVALID_TYPE',
        details: { allowed },
      },
    });
  }
}
