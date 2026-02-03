import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List applications with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Applications retrieved successfully',
  })
  async list(
    @Query() query: { page?: number; limit?: number },
    @Req() req: any,
  ) {
    const universityId =
      req.user?.role === UserRole.UNIVERSITY
        ? req.user.universityId
        : undefined;
    return this.applicationsService.list({ ...query, universityId });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get application by id' })
  @ApiResponse({
    status: 200,
    description: 'Application retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - not your application',
  })
  async findById(@Param('id') id: string, @Req() req: any) {
    const app = await this.applicationsService.findByIdWithoutResponse(id);
    if (
      req.user?.role === UserRole.UNIVERSITY &&
      app &&
      app.universityId !== req.user.universityId
    ) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }
    return this.applicationsService.findById(id, req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new application (coordinator)' })
  @ApiResponse({
    status: 201,
    description: 'Application created successfully',
  })
  async create(@Body() createApplicationDto: any, @Req() req: any) {
    return this.applicationsService.createApplication({
      ...createApplicationDto,
      universityId: req.user.universityId,
    });
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an application (coordinator, PENDING only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Application updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Application can only be updated in PENDING status',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - not your application',
  })
  async update(
    @Param('id') id: string,
    @Body() updateApplicationDto: any,
    @Req() req: any,
  ) {
    const app = await this.applicationsService.findByIdWithoutResponse(id);
    if (!app) {
      throw new ForbiddenException({
        success: false,
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', details: null },
      });
    }
    if (req.user?.role === UserRole.UNIVERSITY && app.universityId !== req.user.universityId) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }
    return this.applicationsService.updateApplication(id, updateApplicationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive application (coordinator)',
  })
  @ApiResponse({
    status: 200,
    description: 'Application archived successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Application cannot be archived',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - not your application',
  })
  async delete(@Param('id') id: string, @Req() req: any) {
    const app = await this.applicationsService.findByIdWithoutResponse(id);
    if (!app) {
      throw new ForbiddenException({
        success: false,
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', details: null },
      });
    }
    if (app.universityId !== req.user.universityId) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }
    return this.applicationsService.deleteApplication(id, req.user);
  }

  @Post(':id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit application for review' })
  @ApiResponse({
    status: 200,
    description: 'Application submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Application cannot be submitted (wrong status)',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - not your application',
  })
  async submit(@Param('id') id: string, @Req() req: any) {
    const app = await this.applicationsService.findByIdWithoutResponse(id);
    if (!app) {
      throw new ForbiddenException({
        success: false,
        message: 'Application not found',
        error: { code: 'APPLICATION_NOT_FOUND', details: null },
      });
    }
    if (app.universityId !== req.user.universityId) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }
    return this.applicationsService.submitForReview(id);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Review application (ADMIN only)' })
  @ApiResponse({
    status: 200,
    description: 'Application reviewed successfully',
  })
  async review(
    @Param('id') id: string,
    @Body()
    reviewDto: { decision: 'APPROVE' | 'REJECT'; rejectionReason?: string },
    @Req() req: any,
  ) {
    return this.applicationsService.reviewApplication(
      id,
      req.user.id,
      reviewDto,
    );
  }
}
