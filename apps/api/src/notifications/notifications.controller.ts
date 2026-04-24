import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(
    UserRole.ADMIN,
    UserRole.UNIVERSITY,
    UserRole.SUPERVISOR,
    UserRole.MENTOR,
    UserRole.INTERN,
  )
  @ApiOperation({ summary: 'List notifications for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async list(
    @Req() req: any,
    @Query()
    query: { page?: string; limit?: string; unreadOnly?: string },
  ) {
    return this.notificationsService.listForUser(req.user.id, {
      page: query?.page ? Number(query.page) : undefined,
      limit: query?.limit ? Number(query.limit) : undefined,
      unreadOnly: query?.unreadOnly === 'true',
    });
  }

  @Patch(':id/read')
  @Roles(
    UserRole.ADMIN,
    UserRole.UNIVERSITY,
    UserRole.SUPERVISOR,
    UserRole.MENTOR,
    UserRole.INTERN,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: any,
  ) {
    return this.notificationsService.markRead(req.user.id, id);
  }

  @Patch('read-all')
  @Roles(
    UserRole.ADMIN,
    UserRole.UNIVERSITY,
    UserRole.SUPERVISOR,
    UserRole.MENTOR,
    UserRole.INTERN,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  async markAllRead(@Req() req: any) {
    return this.notificationsService.markAllRead(req.user.id);
  }
}
