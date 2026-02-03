import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { InternStatus } from '../../common/enums/intern-status.enum';

export class QueryInternsDto {
  @ApiPropertyOptional({
    example: InternStatus.ACTIVE,
    description: 'Filter interns by status',
    enum: InternStatus,
  })
  @IsOptional()
  @IsEnum(InternStatus)
  status?: InternStatus;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter interns by department ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Filter interns by supervisor ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  @ApiPropertyOptional({
    example: 'Jane',
    description: 'Search interns by name or intern ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Include interns starting on or after this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Include interns starting on or before this date',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (default: 1)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page (default: 10, max: 50)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
