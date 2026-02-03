import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class MarkArrivedDto {
  @ApiPropertyOptional({
    example: 'Student arrived on time and completed orientation',
    description:
      'Optional notes for audit trail when marking student as arrived',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Notes cannot exceed 500 characters' })
  notes?: string;
}
