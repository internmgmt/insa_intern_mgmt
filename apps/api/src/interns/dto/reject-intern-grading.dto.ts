import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectInternGradingDto {
  @ApiProperty({ description: 'Reason for rejecting the supervisor evaluation', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({ description: 'Optional detailed notes', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
