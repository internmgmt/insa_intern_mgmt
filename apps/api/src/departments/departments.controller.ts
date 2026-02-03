import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { QueryInternsDto } from './dto/query-interns.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all departments' })
  @ApiResponse({
    status: 200,
    description: 'Departments retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Departments retrieved successfully',
        data: {
          items: [{ id: 'uuid', name: 'Department Name' }],
        },
      },
    },
  })
  async findAll() {
    return this.departmentsService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({
    status: 201,
    description: 'Department created successfully',
    schema: {
      example: {
        success: true,
        message: 'Department created successfully',
        data: {
          id: 'uuid',
          name: 'DevOps',
          type: 'SOFTWARE_DEVELOPMENT',
          description: 'DevOps and CI/CD',
        },
      },
    },
  })
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({
    status: 200,
    description: 'Department retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async getById(@Param('id') id: string) {
    return this.departmentsService.getById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update department (name and description only)' })
  @ApiResponse({
    status: 200,
    description: 'Department updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Department name already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Get(':id/interns')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get department interns with pagination and filters',
  })
  @ApiResponse({
    status: 200,
    description: 'Department interns retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'SUPERVISOR can only access their own department',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async getDepartmentInterns(
    @Param('id') id: string,
    @Query() query: QueryInternsDto,
    @Req() req: any,
  ) {
    // SUPERVISOR can only access their own department
    if (req.user.role === UserRole.SUPERVISOR) {
      if (req.user.departmentId !== id) {
        throw new ForbiddenException({
          success: false,
          message: 'You can only access interns in your own department',
          error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
        });
      }
    }

    return this.departmentsService.getDepartmentInterns(id, query);
  }

  @Get(':id/supervisors')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get department supervisors with intern counts' })
  @ApiResponse({
    status: 200,
    description: 'Department supervisors retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async getDepartmentSupervisors(@Param('id') id: string) {
    return this.departmentsService.getDepartmentSupervisors(id);
  }
}
