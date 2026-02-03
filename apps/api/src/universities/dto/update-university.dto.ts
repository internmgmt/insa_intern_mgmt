import {
  IsOptional,
  IsString,
  IsEmail,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUniversityDto {
  @ApiProperty({
    example: 'Addis Ababa University',
    description: 'University name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

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
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}
