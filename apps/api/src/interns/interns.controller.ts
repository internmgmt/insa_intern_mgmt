import {
  Controller,
  Delete,
  Post,
  Patch,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternsService } from './interns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { QueryInternsDto } from './dto/query-interns.dto';
import { UpdateInternDto } from './dto/update-intern.dto';
import { CompleteInternDto } from './dto/complete-intern.dto';
import { TerminateInternDto } from './dto/terminate-intern.dto';
import { IssueCertificateDto } from './dto/issue-certificate.dto';
import { SuspendInternDto } from './dto/suspend-intern.dto';
import { AssignSupervisorDto } from './dto/assign-supervisor.dto';
import { UserEntity } from '../entities/user.entity';
import { InternEntity } from '../entities/intern.entity';
import { SUPERVISOR_WRONG_DEPARTMENT } from '../common/filters/http-exception.filter';

@ApiTags('interns')
@Controller('interns')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InternsController {
  constructor(
    private readonly internsService: InternsService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(InternEntity)
    private readonly internRepository: Repository<InternEntity>,
  ) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create intern from student' })
  @ApiResponse({ status: 201, description: 'Intern created successfully' })
  async create(@Body() body: {
    studentId: string;
    supervisorId?: string;
    departmentId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    return this.internsService.createInternFromStudent(
      body.studentId,
      {
        supervisorId: body.supervisorId,
        departmentId: body.departmentId,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      }
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiOperation({ summary: 'List interns with optional pagination' })
  @ApiResponse({ status: 200, description: 'Interns retrieved successfully' })
  async list(@Query() query: QueryInternsDto, @Req() req: any) {
    return this.internsService.list(query, req.user);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.INTERN)
  @ApiOperation({ summary: 'Get intern by id' })
  @ApiResponse({ status: 200, description: 'Intern retrieved successfully' })
  async getById(@Param('id') id: string, @Req() req: any) {
    return this.internsService.getById(id, req.user);
  }

  @Get('me')
  @Roles(UserRole.INTERN)
  @ApiOperation({ summary: 'Get current intern profile' })
  @ApiResponse({ status: 200, description: 'Intern profile retrieved' })
  async me(@Req() req: any) {
    return this.internsService.getMyProfile(req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.INTERN)
  @ApiOperation({
    summary: 'Update intern',
  })
  @ApiResponse({ status: 200, description: 'Intern updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateInternDto: UpdateInternDto,
    @Req() req: any,
  ) {
    return this.internsService.update(id, updateInternDto, req.user);
  }

  @Post(':id/assign-supervisor')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign supervisor to intern' })
  @ApiResponse({ status: 200, description: 'Supervisor assigned successfully' })
  async assignSupervisor(
    @Param('id') id: string,
    @Body() assignSupervisorDto: AssignSupervisorDto,
  ) {
    const intern = await this.internRepository.findOne({ where: { id } });
    if (!intern) {
      throw new NotFoundException({
        success: false,
        message: 'Intern not found',
        error: { code: 'INTERN_NOT_FOUND', details: null },
      });
    }

    const supervisor = await this.userRepository.findOne({
      where: { id: assignSupervisorDto.supervisorId },
    });
    if (!supervisor || supervisor.role !== UserRole.SUPERVISOR) {
      throw new BadRequestException({
        success: false,
        message: 'Supervisor must have SUPERVISOR role',
        error: { code: 'INVALID_SUPERVISOR', details: null },
      });
    }

    if (
      intern.departmentId &&
      supervisor.departmentId &&
      intern.departmentId !== supervisor.departmentId
    ) {
      throw new BadRequestException({
        success: false,
        message: 'Supervisor must belong to the same department as intern',
        error: { code: SUPERVISOR_WRONG_DEPARTMENT, details: null },
      });
    }

    return this.internsService.assignSupervisor(
      id,
      assignSupervisorDto.supervisorId,
    );
  }

  @Post(':id/complete')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark intern as completed' })
  @ApiResponse({ status: 200, description: 'Intern marked as completed' })
  async complete(
    @Param('id') id: string,
    @Body() completeDto: CompleteInternDto,
  ) {
    return this.internsService.complete(id, completeDto);
  }

  @Post(':id/terminate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate intern' })
  @ApiResponse({ status: 200, description: 'Intern terminated' })
  async terminate(
    @Param('id') id: string,
    @Body() terminateDto: TerminateInternDto,
  ) {
    return this.internsService.terminate(id, terminateDto);
  }

  @Post(':id/suspend')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend intern' })
  @ApiResponse({ status: 200, description: 'Intern suspended' })
  async suspend(
    @Param('id') id: string,
    @Body() suspendDto: SuspendInternDto,
  ) {
    return this.internsService.suspend(id, suspendDto);
  }

  @Post(':id/unsuspend')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsuspend intern' })
  @ApiResponse({ status: 200, description: 'Intern unsuspended' })
  async unsuspend(@Param('id') id: string) {
    return this.internsService.unsuspend(id);
  }

  @Post(':id/issue-certificate')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Issue certificate for intern' })
  @ApiResponse({ status: 200, description: 'Certificate issued' })
  async issueCertificate(
    @Param('id') id: string,
    @Body() issueCertificateDto: IssueCertificateDto,
  ) {
    return this.internsService.issueCertificate(id, issueCertificateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete intern record' })
  @ApiResponse({ status: 200, description: 'Intern deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.internsService.delete(id);
  }
}
