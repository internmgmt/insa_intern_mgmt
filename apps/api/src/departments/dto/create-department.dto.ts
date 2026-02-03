import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DepartmentType } from '../../common/enums/department-type.enum';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Networking', description: 'Department name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: DepartmentType.NETWORKING,
    description: 'Department type',
    enum: DepartmentType,
  })
  @IsEnum(DepartmentType)
  @IsNotEmpty()
  type: DepartmentType;

  @ApiProperty({
    example: 'Network infrastructure, administration, and security',
    description: 'Department description',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
