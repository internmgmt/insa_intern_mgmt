import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.INTERN, UserRole.MENTOR, UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new submission' })
  @ApiResponse({ status: 201, description: 'Submission created successfully' })
  async create(@Body() createSubmissionDto: any, @CurrentUser() user: any) {
    return this.submissionsService.create(createSubmissionDto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.INTERN, UserRole.MENTOR, UserRole.SUPERVISOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a submission' })
  @ApiResponse({ status: 200, description: 'Submission updated successfully' })
  async update(@Param('id') id: string, @Body() updateSubmissionDto: any) {
    return this.submissionsService.update(id, updateSubmissionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List submissions with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Submissions retrieved successfully',
  })
  async list(
    @Query() query: { page?: number; limit?: number; status?: string },
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.list(query, user);
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
    const limit = query?.limit && Number(query.limit) > 0 ? Number(query.limit) : 100;

    // Use a direct query for performance
    return this.submissionsService.list({ 
      page, 
      limit, 
      studentId: user.studentId, // If the user has a linked student record
      userId: user.id 
    }, user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MENTOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get submission by id' })
  @ApiResponse({
    status: 200,
    description: 'Submission retrieved successfully',
  })
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.submissionsService.findById(id);
  }

  @Post(':id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.MENTOR)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Review a submission (approve/reject)' })
  @ApiResponse({ status: 200, description: 'Submission reviewed successfully' })
  async review(
    @Param('id') id: string,
    @Body() body: { decision: 'APPROVE' | 'REJECT'; rejectionReason?: string; score?: number; feedback?: string },
    @CurrentUser() user: any,
  ) {
    return this.submissionsService.reviewSubmission(
      id,
      user?.id ?? null,
      body.decision,
      body.rejectionReason,
      body.score,
      body.feedback,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MENTOR, UserRole.SUPERVISOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a submission/task' })
  @ApiResponse({ status: 200, description: 'Submission deleted successfully' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.submissionsService.delete(id);
  }
}
