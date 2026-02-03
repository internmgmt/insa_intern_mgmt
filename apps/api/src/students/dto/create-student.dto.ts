import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEmail,
  IsUrl,
  Matches,
} from 'class-validator';
import { IsAcademicYear } from '../../common/validators/student.validators';

export class CreateStudentDto {
  @ApiProperty({ example: 'Jane', description: 'Student first name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Student last name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    example: 'INSA-2025-001',
    description: 'Institution student id',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9\-]+$/i, {
    message: 'Student ID must contain only alphanumeric characters and hyphens',
  })
  @MaxLength(50)
  studentId: string;

  @ApiProperty({ example: 'Computer Science', description: 'Field of study' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fieldOfStudy: string;

  @ApiProperty({ example: '2024/2025', description: 'Academic year' })
  @IsNotEmpty()
  @IsAcademicYear()
  academicYear: string;

  @ApiPropertyOptional({
    example: 'student@example.edu',
    description: 'Student email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+251911000000',
    description: 'Phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/cv.pdf',
    description: 'CV URL',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  cvUrl?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/transcript.pdf',
    description: 'Transcript URL',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  transcriptUrl?: string;
}
