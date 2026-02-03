import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'ADMIN',
            isFirstLogin: true,
            isActive: true,
          },
          token: 'jwt_token_here',
          expiresIn: 86400,
        },
      },
    },
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current user' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      example: {
        success: true,
        message: 'Logout successful',
        data: null,
      },
    },
  })
  async logout(@Request() req: any) {
    return this.authService.logout(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
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
          role: 'ADMIN',
          isFirstLogin: true,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          university: {
            id: 'uuid',
            name: 'University Name',
          },
          department: {
            id: 'uuid',
            name: 'Department Name',
            type: 'NETWORKING',
          },
          intern: {
            id: 'uuid',
            internId: 'INSA-2024-001',
          },
        },
      },
    },
  })
  async getCurrentUser(@Request() req: any) {
    return this.authService.getCurrentUser(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for current user' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      example: {
        success: true,
        message: 'Password changed successfully',
        data: null,
      },
    },
  })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if user exists)',
    schema: {
      example: {
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email format',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      example: {
        success: true,
        message: 'Password has been reset successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid token, expired token, or password validation failed',
    schema: {
      example: {
        success: false,
        message: 'Invalid or expired reset token',
        error: {
          code: 'INVALID_TOKEN',
          details: null,
        },
      },
    },
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
      resetPasswordDto.confirmPassword,
    );
  }
}
