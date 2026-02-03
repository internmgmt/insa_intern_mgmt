import {
  IsOptional,
  IsNumber,
  IsString,
  IsBoolean,
  IsEnum,
  IsUUID,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class QueryUsersDto {
  @ApiProperty({
    example: 1,
    description: 'Page number (default: 1)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: 'Items per page (default: 10, max: 100)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    example: 'SUPERVISOR',
    description: 'Filter by role (ADMIN, UNIVERSITY, SUPERVISOR, INTERN)',
    enum: [
      UserRole.ADMIN,
      UserRole.UNIVERSITY,
      UserRole.SUPERVISOR,
      UserRole.INTERN,
    ],
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    example: 'John',
    description: 'Search by first name, last name, or email',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: true,
    description: 'Filter by active status',
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Filter by department ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string;
}
