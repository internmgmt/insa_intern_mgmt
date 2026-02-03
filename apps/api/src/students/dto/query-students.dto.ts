import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  Min,
  IsInt,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { StudentStatus } from '../../common/enums/student-status.enum';

export class QueryStudentsDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Items per page (max: 50)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({
    enum: StudentStatus,
    description: 'Filter by student status',
  })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({
    description: 'Search by name or student ID',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by intern account existence',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  hasInternAccount?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by university ID (Admin only)',
  })
  @IsOptional()
  @IsString()
  universityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by academic year (Admin only)',
  })
  @IsOptional()
  @IsString()
  academicYear?: string;
}
