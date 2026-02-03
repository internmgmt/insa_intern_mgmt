import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
  IsArray,
  ArrayUnique,
  IsObject,
  IsBoolean,
  MaxLength,
} from 'class-validator';

export class UploadDocumentDto {
  @ApiProperty({
    example: 'Intern Weekly Report',
    description: 'Document title',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Associated student ID (optional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiProperty({
    example: 'https://cdn.example.com/docs/report.pdf',
    description:
      'Public URL to the uploaded file (optional when uploading file)',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  url?: string;

  @ApiProperty({
    example: { pageCount: 10, mimeType: 'application/pdf' },
    description: 'Arbitrary metadata for the document (optional)',
    required: false,
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    example: ['report', 'week-1'],
    description: 'Optional tags for the document',
    required: false,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Type(() => String)
  tags?: string[];

  @ApiProperty({
    example: true,
    description: 'Whether the document is publicly accessible',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    example: 'OFFICIAL_LETTER',
    description: 'Type of the document',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  type?: string;

  @ApiProperty({
    example: 'OFFICIAL_LETTER',
    description: 'Alias for type',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentType?: string;

  @ApiProperty({
    example: 'APPLICATION',
    description: 'Type of entity the document is linked to',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityType?: string;

  @ApiProperty({
    example: 'uuid',
    description: 'ID of the entity the document is linked to',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  entityId?: string;

  @ApiProperty({
    example: 'uuid',
    description: 'Alias for entityId (legacy support)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  applicationId?: string;
}
