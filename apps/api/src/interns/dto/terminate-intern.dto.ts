import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class TerminateInternDto {
  @ApiProperty({
    example: 'Breach of internship agreement and repeated misconduct',
    description:
      'Reason for terminating the internship (required, max 1000 chars)',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;
}
