import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class AssignSupervisorDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Supervisor user ID (UUID)',
  })
  @IsUUID()
  @IsNotEmpty()
  supervisorId: string;
}
