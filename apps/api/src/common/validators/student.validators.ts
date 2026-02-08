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
  if (!year || typeof year !== 'string') return false;
  
  // Preliminary cleanup: decoded HTML entity for slash if present
  const cleaned = year.replace(/&#x2F;/gi, '/').trim();
  
  // Find all sequences of digits
  const digitGroups = cleaned.match(/\d+/g);
  if (!digitGroups || digitGroups.length < 2) return false;
  
  const startStr = digitGroups[0];
  const endStr = digitGroups[1];
  
  // First year should be 4 digits (e.g., 2024)
  if (startStr.length !== 4) return false;
  
  const start = parseInt(startStr, 10);
  let end = parseInt(endStr, 10);
  
  // Support both 4-digit (2025) and 2-digit (25) for the second year
  if (endStr.length === 2) {
    end = Math.floor(start / 100) * 100 + end;
  } else if (endStr.length !== 4) {
    return false;
  }
  
  // Years must be consecutive
  return end === start + 1;
}

@ValidatorConstraint({ name: 'isAcademicYear', async: false })
export class IsAcademicYearConstraint implements ValidatorConstraintInterface {
  validate(year: string) {
    return validateAcademicYearFormat(year);
  }

  defaultMessage() {
    return 'Academic year must be consecutive years in format YYYY/YYYY (e.g., 2024/2025) or YYYY/YY (e.g., 2024/25)';
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
