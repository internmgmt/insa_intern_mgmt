import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SubmissionsService } from './submissions.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('submissions')
@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.INTERN, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new submission' })
  @ApiResponse({ status: 201, description: 'Submission created successfully' })
  async create(@Body() createSubmissionDto: any) {
    return this.submissionsService.create(createSubmissionDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a submission' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully' })
  async update(@Param('id') id: string, @Body() updateSubmissionDto: any) {
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List submissions with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully',
  })
  async list(@Query() query?: { page?: number; limit?: number }) {
    return this.submissionsService.list(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get submission by id' })
  @ApiResponse({
    status: 200,
    description: 'Submission retrieved successfully',
  })
  async findById(@Param('id') id: string) {
    return this.submissionsService.findById(id);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get submissions for current user' })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully for current user',
  })
  async my(
    @CurrentUser() user: any,
    @Query() query?: { page?: number; limit?: number },
  ) {
    const page = query?.page && Number(query.page) > 0 ? Number(query.page) : 1;
    const limit =
      query?.limit && Number(query.limit) > 0 ? Number(query.limit) : 20;

    const all = await this.submissionsService.list({ page: 1, limit: 10000 });
    const items = (all?.data?.items || []).filter((s: any) => {
      if (!s.student) return false;
      if (user?.email && s.student.email && s.student.email === user.email)
        return true;
      if (user?.id && s.student.userId && s.student.userId === user.id)
        return true;
      return false;
    });

    const totalItems = items.length;
    const start = (page - 1) * limit;
    const pagedItems = items.slice(start, start + limit);

    return {
      success: true,
      message: 'Submissions retrieved successfully',
      data: {
        items: pagedItems,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.max(1, Math.ceil(totalItems / limit || 1)),
        },
      },
    };
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPERVISOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Review a submission (approve/reject)' })
  @ApiResponse({ status: 200, description: 'Submission reviewed successfully' })
  async review(
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVE' | 'REJECT'; rejectionReason?: string },
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.reviewSubmission(
      id,
      user?.id ?? null,
      body.decision,
      body.rejectionReason,
    );
  }
}
