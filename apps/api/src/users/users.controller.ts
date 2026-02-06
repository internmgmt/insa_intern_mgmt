import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users with pagination and filters' })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Users retrieved successfully',
        data: {
          items: [
            {
              id: 'uuid',
              email: 'user@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'SUPERVISOR',
              isActive: true,
              isFirstLogin: true,
              department: {
                id: 'uuid',
                name: 'Networking',
              },
              university: {
                id: 'uuid',
                name: 'University Name',
              },
              createdAt: '2024-01-01T00:00:00Z',
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            totalItems: 50,
            totalPages: 5,
          },
        },
      },
    },
  })
  async findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'User retrieved successfully',
        data: {
          id: 'uuid',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'SUPERVISOR',
          isActive: true,
          isFirstLogin: true,
          department: {
            id: 'uuid',
            name: 'Networking',
            type: 'NETWORKING',
          },
          university: {
            id: 'uuid',
            name: 'University Name',
          },
          supervisedInterns: [],
          createdAt: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  async findById(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        success: true,
        message: 'User created successfully. Temporary password sent to email.',
        data: {
          id: 'uuid',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'SUPERVISOR',
          isActive: true,
          isFirstLogin: true,
          createdAt: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      example: {
        success: true,
        message: 'User updated successfully',
        data: {
          id: 'uuid',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'SUPERVISOR',
          isActive: true,
          isFirstLogin: true,
          updatedAt: '2024-01-01T00:00:00Z',
        },
      },
    },
  })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate user (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'User deactivated successfully',
    schema: {
      example: {
        success: true,
        message: 'User deactivated successfully',
        data: null,
      },
    },
  })
  async delete(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usersService.deactivate(id);
  }
}