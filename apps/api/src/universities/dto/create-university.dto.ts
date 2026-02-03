import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MaxLength,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CoordinatorDto {
  @ApiProperty({ example: 'Samuel', description: 'Coordinator first name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ example: 'Bekele', description: 'Coordinator last name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @ApiProperty({
    example: 'coordinator@aau.edu.et',
    description: 'Coordinator email address',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class CreateUniversityDto {
  @ApiProperty({
    example: 'Addis Ababa University',
    description: 'University name',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    example: 'Adama Science and Technology University',
    description: 'University address',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({
    example: 'info@aau.edu.et',
    description: 'Contact email',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({
    example: '+251912345678',
    description: 'Contact phone number',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({
    example: true,
    description: 'Is university active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    type: CoordinatorDto,
    required: false,
    description: 'Optional coordinator details (firstName, lastName, email)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatorDto)
  coordinator?: CoordinatorDto;
}
