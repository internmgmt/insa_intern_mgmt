import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsOptional,
  MaxLength,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class ReviewStudentDto {
  @ApiProperty({
    example: 'ACCEPT',
    enum: ['ACCEPT', 'REJECT'],
    description: 'Decision for the student application',
  })
  @IsEnum(['ACCEPT', 'REJECT'])
  decision: 'ACCEPT' | 'REJECT';

  @ApiPropertyOptional({
    example: 'Incomplete documents',
    description: 'Reason for rejection',
  })
  @ValidateIf((o) => o.decision === 'REJECT')
  @IsNotEmpty({
    message: 'Rejection reason is required when rejecting a student',
  })
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
