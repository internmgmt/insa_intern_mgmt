import type { Express } from 'express';
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { UploadDocumentDto } from './dto/upload-document.dto';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) { }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY, UserRole.INTERN)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a document or provide URL' })
  @ApiResponse({ status: 201, description: 'Document created successfully' })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadDocumentDto,
    @Req() req: any,
  ) {
    const docType =
      (body as any)?.documentType ||
      (body as any)?.type ||
      (body as any)?.category ||
      null;

    if (req.user.role === UserRole.UNIVERSITY) {
      const allowed = ['OFFICIAL_LETTER', 'CV', 'TRANSCRIPT'];
      if (!allowed.includes(docType)) {
        throw new ForbiddenException({
          success: false,
          message:
            'Universities can only upload OFFICIAL_LETTER, CV, or TRANSCRIPT documents',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    if (req.user.role === UserRole.INTERN) {
      const allowedIntern = ['SUBMISSION'];
      if (!allowedIntern.includes(docType)) {
        throw new ForbiddenException({
          success: false,
          message: 'Interns can only upload submission files',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    const url = file?.path || (file as any)?.location || body.url;
    const payload = { ...body, url };
    return this.documentsService.create(payload, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List documents with pagination' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async list(
    @Query() query: { page?: number; limit?: number },
    @Req() req: any,
  ) {
    const res: any = await this.documentsService.list(query, req.user);
    return res;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.UNIVERSITY,
    UserRole.INTERN,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get document by id (includes file and metadata)' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully' })
  async findById(@Param('id') id: string, @Req() req: any) {
    const res: any = await this.documentsService.findById(id);
    const doc = res?.data;
    if (
      req.user.role === UserRole.UNIVERSITY &&
      doc &&
      doc.uploadedBy !== req.user.id &&
      !(
        doc?.entityType === 'APPLICATION' &&
        doc?.entity?.universityId === req.user.universityId
      )
    ) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }
    return res;
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.UNIVERSITY,
    UserRole.INTERN,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Download document with standardized filename' })
  @ApiResponse({ status: 200, description: 'File download' })
  async download(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: any,
  ) {
    const { filePath, fileName } = await this.documentsService.download(
      id,
      req.user,
    );
    const path = require('path');
    const fs = require('fs');

    // Create absolute path and ensure it's within uploads directory
    const absolutePath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundException({
        success: false,
        message: 'File not found on server',
        error: { code: 'FILE_NOT_FOUND', details: null },
      });
    }

    return res.download(absolutePath, fileName);
  }

  @Get(':id/info')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
    UserRole.UNIVERSITY,
    UserRole.INTERN,
  )
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get document metadata by id' })
  @ApiResponse({
    status: 200,
    description: 'Document metadata retrieved successfully',
  })
  async info(@Param('id') id: string, @Req() req: any) {
    const res: any = await this.documentsService.findById(id);
    const doc = res?.data ?? null;

    if (
      req.user.role === UserRole.UNIVERSITY &&
      doc &&
      doc.uploadedBy !== req.user.id &&
      !(
        doc?.entityType === 'APPLICATION' &&
        doc?.entity?.universityId === req.user.universityId
      )
    ) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }

    return {
      success: true,
      message: 'Document metadata retrieved successfully',
      data: {
        id: doc?.id ?? id,
        title: doc?.title ?? null,
        metadata: doc?.metadata ?? null,
        url: doc?.url ?? null,
      },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.documentsService.remove(id, req.user);
  }
}
