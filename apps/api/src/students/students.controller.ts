import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { ReviewStudentDto } from './dto/review-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { MarkArrivedDto } from './dto/mark-arrived.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('Students')
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Get('students')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all students (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  async listAll(
    @Query() query: QueryStudentsDto,
    @Req() req: any,
  ) {
    return this.studentsService.listAll(query, req.user);
  }

  @Get('applications/:appId/students')
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY)
  @ApiOperation({ summary: 'List students in an application' })
  @ApiResponse({
    status: 200,
    description: 'Students retrieved successfully',
  })
  async listByApplication(
    @Param('appId') appId: string,
    @Query() query: QueryStudentsDto,
    @Req() req: any,
  ) {
    return this.studentsService.listByApplication(appId, query, req.user);
  }

  @Post('applications/:appId/students')
  @Roles(UserRole.UNIVERSITY)
  @ApiOperation({ summary: 'Add a student to an application' })
  @ApiResponse({
    status: 201,
    description: 'Student added successfully',
  })
  async addStudent(
    @Param('appId') appId: string,
    @Body() createStudentDto: CreateStudentDto,
    @Req() req: any,
  ) {
    return this.studentsService.addStudent(appId, createStudentDto, req.user);
  }

  @Post('applications/students')
  @Roles(UserRole.UNIVERSITY)
  @ApiOperation({ summary: 'Add a student to the latest editable application for your university' })
  @ApiResponse({
    status: 201,
    description: 'Student added successfully',
  })
  async addStudentToLatest(
    @Body() body: any,
    @Req() req: any,
  ) {
    // body may include applicationId to explicitly target an application
    return this.studentsService.addStudentFlexible(body.applicationId, body, req.user);
  }

  @Patch('applications/:appId/students/:id')
  @Roles(UserRole.UNIVERSITY)
  @ApiOperation({ summary: 'Update a student' })
  @ApiResponse({
    status: 200,
    description: 'Student updated successfully',
  })
  async updateStudent(
    @Param('appId') appId: string,
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @Req() req: any,
  ) {
    return this.studentsService.updateStudent(id, updateStudentDto, req.user);
  }

  @Delete('applications/:appId/students/:id')
  @Roles(UserRole.UNIVERSITY)
  @ApiOperation({ summary: 'Remove a student' })
  @ApiResponse({
    status: 200,
    description: 'Student removed successfully',
  })
  async removeStudent(
    @Param('appId') appId: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.studentsService.removeStudent(appId, id, req.user);
  }

  @Get('students/:id')
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY)
  @ApiOperation({ summary: 'Get student by id' })
  @ApiResponse({
    status: 200,
    description: 'Student retrieved successfully',
  })
  async getById(@Param('id') id: string, @Req() req: any) {
    return this.studentsService.getById(id, req.user);
  }

  @Patch('students/:id/review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Review a student application' })
  @ApiResponse({
    status: 200,
    description: 'Student reviewed successfully',
  })
  async reviewStudent(
    @Param('id') id: string,
    @Body() reviewDto: ReviewStudentDto,
  ) {
    return this.studentsService.reviewStudent(
      id,
      reviewDto.decision,
      reviewDto.rejectionReason,
    );
  }

  // Spec & web-app alignment: support POST /students/:id/review
  // Mirrors PATCH behavior to allow coordinator→admin review flow via POST.
  @Post('students/:id/review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Review a student application (POST)' })
  @ApiResponse({
    status: 200,
    description: 'Student reviewed successfully',
  })
  async reviewStudentPost(
    @Param('id') id: string,
    @Body() reviewDto: ReviewStudentDto,
  ) {
    return this.studentsService.reviewStudent(
      id,
      reviewDto.decision,
      reviewDto.rejectionReason,
    );
  }

  @Post('students/:id/mark-arrived')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark a student as arrived' })
  @ApiResponse({
    status: 200,
    description: 'Student marked as arrived successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Student is not in AWAITING_ARRIVAL status',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  async markArrived(
    @Param('id') id: string,
    @Body() markArrivedDto: MarkArrivedDto,
  ) {
    return this.studentsService.markArrived(id, markArrivedDto.notes);
  }
}
