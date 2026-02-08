import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, IsEmail } from 'class-validator';
import { Exclude } from 'class-transformer';
import { IsAcademicYear } from '../../common/validators/student.validators';

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

  // Explicitly exclude studentId from updates
  @Exclude()
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
  @IsAcademicYear()
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

  @ApiProperty({
    example: 'https://example.com/cv.pdf',
    description: 'CV URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  cvUrl?: string;

  @ApiProperty({
    example: 'https://example.com/transcript.pdf',
    description: 'Transcript URL',
    required: false,
  })
  @IsOptional()
  @IsString()
  transcriptUrl?: string;
}
