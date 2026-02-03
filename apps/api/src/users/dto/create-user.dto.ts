import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsEnum,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address (must be unique)',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'User first name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'User last name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    example: 'SUPERVISOR',
    description: 'User role (ADMIN, UNIVERSITY, SUPERVISOR)',
    enum: [UserRole.ADMIN, UserRole.UNIVERSITY, UserRole.SUPERVISOR],
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Department ID (required if role is SUPERVISOR)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => o.role === UserRole.SUPERVISOR)
  @IsNotEmpty({
    message: 'departmentId is required when role is SUPERVISOR',
  })
  departmentId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'University ID (required if role is UNIVERSITY)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @ValidateIf((o) => o.role === UserRole.UNIVERSITY)
  @IsNotEmpty({
    message: 'universityId is required when role is UNIVERSITY',
  })
  universityId?: string;
}
