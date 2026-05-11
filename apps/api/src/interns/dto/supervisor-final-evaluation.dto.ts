import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';

export class SupervisorFinalEvaluationDto {
  @ApiProperty({ example: 90, description: 'Attendance score between 0 and 100' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  attendance: number;

  @ApiProperty({ example: 85, description: 'Protocol / documentation score between 0 and 100' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  protocol: number;

  @ApiProperty({ example: 88, description: 'Professional conduct score between 0 and 100' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  conduct: number;

  @ApiProperty({ example: 92, description: 'Work finished / delivery score between 0 and 100' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  workFinished: number;

  @ApiPropertyOptional({
    example: 87,
    description:
      'Optional mentor aggregate (0-100). If omitted, it will be computed automatically from approved submission scores when available.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  mentorAggregate?: number;

  @ApiPropertyOptional({ description: 'Supervisor summary notes for the final evaluation', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
