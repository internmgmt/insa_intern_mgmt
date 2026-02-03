import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  MaxLength,
  IsUrl,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
  IsEmail,
} from 'class-validator';

export class UpdateStudentDto {
  @ApiProperty({
    example: 'Jane',
    description: 'Student first name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Student last name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({
    example: 'INSA-2025-001',
    description: 'Institution student id',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  studentId?: string;

  @ApiProperty({
    example: 'Computer Science',
    description: 'Field of study',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fieldOfStudy?: string;

  @ApiProperty({
    example: '2024/2025',
    description: 'Academic year',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  academicYear?: string;

  @ApiProperty({
    example: 'student@example.edu',
    description: 'Student email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: '+251911000000',
    description: 'Phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class UpdateApplicationDto {
  @ApiProperty({
    example: '2024/2025',
    description: 'Academic year for the application',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(9)
  academicYear?: string;

  @ApiProperty({
    example: 'Fall Internship Batch - 2024',
    description: 'Optional human-friendly application name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    example: 'https://example.com/official_letter.pdf',
    description: 'Official letter URL',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  officialLetterUrl?: string;

  @ApiProperty({
    type: UpdateStudentDto,
    isArray: true,
    description: 'Array of students included in the application',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateStudentDto)
  students?: UpdateStudentDto[];
}
