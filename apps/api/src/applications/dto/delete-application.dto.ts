import { ApiProperty } from '@nestjs/swagger';

export class DeleteApplicationDto {
  @ApiProperty({
    example: 'Application deleted successfully',
    description: 'Confirmation message',
  })
  message: string;
}
