import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateInternDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Student ID (UUID) used to create intern',
  })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'Supervisor user ID (UUID), optional',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  supervisorId?: string;

  @ApiProperty({
    example: 'INSA-2025-ABC12',
    description: 'Optional intern identifier',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  internId?: string;
}
