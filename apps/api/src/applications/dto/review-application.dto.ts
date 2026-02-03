import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ReviewApplicationDto {
  @ApiProperty({ example: 'APPROVE', enum: ['APPROVE', 'REJECT'] })
  @IsIn(['APPROVE', 'REJECT'])
  decision: 'APPROVE' | 'REJECT';

  @ApiProperty({ example: 'Missing required documents', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  rejectionReason?: string;
}
