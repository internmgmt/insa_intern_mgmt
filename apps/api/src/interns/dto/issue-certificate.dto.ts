import { ApiProperty } from '@nestjs/swagger';
import { IsUrl, IsNotEmpty, MaxLength } from 'class-validator';

export class IssueCertificateDto {
  @ApiProperty({
    example: 'https://example.com/certificate.pdf',
    description: 'URL to the issued internship certificate',
  })
  @IsNotEmpty()
  @IsUrl()
  @MaxLength(500)
  certificateUrl: string;
}
