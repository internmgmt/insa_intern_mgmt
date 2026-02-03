import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  ArrayUnique,
  IsString,
  MaxLength,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateInternDto {
  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Department ID (ADMIN only)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Supervisor user ID (ADMIN only)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  @ApiPropertyOptional({
    example: '2024-06-01T00:00:00Z',
    description: 'Intern start date (ADMIN only)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2024-12-01T00:00:00Z',
    description: 'Intern end date (ADMIN only)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    example: ['JavaScript', 'Docker'],
    description: 'Skills (ADMIN or INTERN)',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional({
    example:
      'Performed well in technical interview and demonstrated strong teamwork.',
    description: 'Interview notes (ADMIN only, max 2000 chars)',
    maxLength: 2000,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  interviewNotes?: string;

  @ApiPropertyOptional({
    example: 3.5,
    description: 'Final evaluation score between 0.00 and 4.00 (ADMIN only)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(4)
  finalEvaluation?: number;
}
