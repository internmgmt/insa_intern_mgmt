import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    this.logger.debug(
      `RolesGuard: Required roles: ${JSON.stringify(requiredRoles)}, User role: ${user?.role}`,
    );

    if (!user) {
      this.logger.warn('RolesGuard: No user found in request');
      throw new ForbiddenException({
        success: false,
        message: 'User not found',
        error: {
          code: 'AUTH_USER_NOT_FOUND',
          details: null,
        },
      });
    }

    if (!user.role) {
      this.logger.warn('RolesGuard: User has no role assigned');
      throw new ForbiddenException({
        success: false,
        message: 'User role not defined',
        error: {
          code: 'AUTH_INSUFFICIENT_PERMISSIONS',
          details: null,
        },
      });
    }

    // Check if user's role is in required roles (case-insensitive)
    const userRole = String(user.role).toUpperCase();
    const hasRole = requiredRoles.some(
      (role) => String(role).toUpperCase() === userRole,
    );

    if (!hasRole) {
      this.logger.warn(
        `RolesGuard: User role "${user.role}" not in required roles: ${JSON.stringify(requiredRoles)}`,
      );
      throw new ForbiddenException({
        success: false,
        message: 'Insufficient permissions',
        error: {
          code: 'AUTH_INSUFFICIENT_PERMISSIONS',
          details: null,
        },
      });
    }

    return true;
  }
}
