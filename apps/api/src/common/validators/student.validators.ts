import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { Repository, Not } from 'typeorm';
import { StudentEntity } from '../../entities/student.entity';

export async function ensureStudentIdUnique(
  studentRepository: Repository<StudentEntity>,
  studentId: string,
  excludeId?: string,
): Promise<void> {
  const where: any = { studentId };

  if (excludeId) {
    where.id = Not(excludeId);
  }

  const existing = await studentRepository.findOne({
    where,
  });

  if (existing) {
    throw new ConflictException({
      success: false,
      message: 'Student with this studentId already exists',
      error: {
        code: 'STUDENT_ID_EXISTS',
        details: null,
      },
    });
  }
}

export function validateAcademicYearFormat(year: string): boolean {
  if (!year) return false;
  const m = /^(\d{4})\/(\d{4})$/.exec(year.trim());
  if (!m) return false;
  const start = parseInt(m[1], 10);
  const end = parseInt(m[2], 10);
  return end === start + 1;
}

@ValidatorConstraint({ name: 'isAcademicYear', async: false })
export class IsAcademicYearConstraint implements ValidatorConstraintInterface {
  validate(year: string) {
    return validateAcademicYearFormat(year);
  }

  defaultMessage() {
    return 'Academic year must be in format YYYY/YYYY (e.g. 2024/2025) and consecutive years';
  }
}

export function IsAcademicYear(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsAcademicYearConstraint,
    });
  };
}
