import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UniversitiesService } from './universities.service';
import { CreateUniversityDto } from './dto/create-university.dto';
import { UpdateUniversityDto } from './dto/update-university.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('universities')
@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  // Make listing universities public to allow coordinator UI to load
  @Public()
  @ApiOperation({ summary: 'List all universities' })
  @ApiResponse({
    status: 200,
    description: 'Universities retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Universities retrieved successfully',
        data: {
          items: [{ id: 'uuid', name: 'University Name' }],
        },
      },
    },
  })
  async findAll() {
    return this.universitiesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get university by id' })
  @ApiResponse({
    status: 200,
    description: 'University retrieved successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied - not your university',
  })
  async getById(@Param('id') id: string, @Req() req: any) {
    if (req.user.role === UserRole.UNIVERSITY && req.user.universityId !== id) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }
    return this.universitiesService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new university (optionally create coordinator)',
  })
  @ApiResponse({
    status: 201,
    description: 'University created successfully',
    schema: {
      example: {
        success: true,
        message: 'University created successfully',
        data: {
          id: 'uuid',
          name: 'Demo University',
          address: '123 Demo St',
          contactEmail: 'contact@demouni.edu',
          contactPhone: '+251911000000',
          isActive: true,
        },
      },
    },
  })
  async create(@Body() createUniversityDto: CreateUniversityDto) {
    return this.universitiesService.create(createUniversityDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.UNIVERSITY)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update university details' })
  @ApiResponse({
    status: 200,
    description: 'University updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'University not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUniversityDto: UpdateUniversityDto,
    @Req() req: any,
  ) {
    // Allow ADMIN to update any, UNIVERSITY only their own
    if (req.user?.role === UserRole.UNIVERSITY && req.user.universityId !== id) {
      throw new ForbiddenException({
        success: false,
        message: 'Access denied',
        error: { code: 'AUTH_INSUFFICIENT_PERMISSIONS', details: null },
      });
    }
    return this.universitiesService.update(id, updateUniversityDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate university' })
  @ApiResponse({
    status: 200,
    description: 'University deactivated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'University not found',
  })
  async delete(@Param('id') id: string) {
    return this.universitiesService.deactivate(id);
  }
}
