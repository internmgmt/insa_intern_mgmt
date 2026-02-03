import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompleteInternDto {
  @ApiProperty({
    example: 3.5,
    description: 'Final evaluation score between 0.00 and 4.00',
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(4)
  finalEvaluation: number;

  @ApiPropertyOptional({
    example: 'Completed all project milestones with excellence.',
    description: 'Optional completion notes',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  completionNotes?: string;
}
