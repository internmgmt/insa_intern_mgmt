import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsUrl,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class CreateStudentDto {
  @ApiProperty({
    example: 'John',
    description: 'Student first name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Student last name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    example: 'STU-2024-001',
    description: 'Unique student ID',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  studentId: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'Field of study',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  fieldOfStudy: string;

  @ApiProperty({
    example: '2024/2025',
    description: 'Academic year',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(9)
  academicYear: string;

  @ApiProperty({
    example: 'student@example.com',
    description: 'Student email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: '+251911000000',
    description: 'Student phone number',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;
}

export class CreateApplicationDto {
  @ApiProperty({
    example: '2024/2025',
    description: 'Academic year for the application',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(9)
  academicYear: string;

  @ApiProperty({
    example: 'Fall Internship Batch - 2024',
    description: 'Human-friendly application name',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'uploads/official_letter.pdf',
    description: 'Official letter URL or path',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  officialLetterUrl: string;

  @ApiProperty({
    type: CreateStudentDto,
    isArray: true,
    description: 'Array of students included in the application (optional)',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentDto)
  students?: CreateStudentDto[];
}
