import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from '../global/services/mail/mail.service';
import {
  validatePasswordMatch,
  validatePasswordStrength,
} from '../common/validators/password.validators';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) { }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['university', 'department'],
    });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid credentials',
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          details: null,
        },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        success: false,
        message: 'User account is deactivated',
        error: {
          code: 'AUTH_ACCOUNT_INACTIVE',
          details: null,
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid credentials',
        error: {
          code: 'AUTH_INVALID_CREDENTIALS',
          details: null,
        },
      });
    }

    const token = this.jwtService.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
          isActive: user.isActive,
          university: user.university
            ? {
              id: user.university.id,
              name: user.university.name,
            }
            : null,
          department: user.department
            ? {
              id: user.department.id,
              name: user.department.name,
              type: user.department.type,
            }
            : null,
        },
        token,
        expiresIn: 86400,
      },
    };
  }

  async logout(user: any) {
    return {
      success: true,
      message: 'Logout successful',
      data: null,
    };
  }

  async getCurrentUser(user: any) {
    const currentUser = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['university', 'department'],
    });

    if (!currentUser) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: null,
        },
      });
    }

    return {
      success: true,
      message: 'User retrieved successfully',
      data: {
        id: currentUser.id,
        email: currentUser.email,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        role: currentUser.role,
        isFirstLogin: currentUser.isFirstLogin,
        isActive: currentUser.isActive,
        createdAt: currentUser.createdAt,
        university: currentUser.university
          ? {
            id: currentUser.university.id,
            name: currentUser.university.name,
          }
          : null,
        department: currentUser.department
          ? {
            id: currentUser.department.id,
            name: currentUser.department.name,
            type: currentUser.department.type,
          }
          : null,
      },
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    validatePasswordMatch(newPassword, confirmPassword);

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        error: {
          code: 'USER_NOT_FOUND',
          details: null,
        },
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestException({
        success: false,
        message: 'Current password is incorrect',
        error: {
          code: 'AUTH_INVALID_PASSWORD',
          details: null,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHash = hashedPassword;
    user.isFirstLogin = false;

    await this.userRepository.save(user);

    return {
      success: true,
      message: 'Password changed successfully',
      data: null,
    };
  }

  async validateUser(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'User not found',
        error: {
          code: 'AUTH_UNAUTHORIZED',
          details: null,
        },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        success: false,
        message: 'User account is deactivated',
        error: {
          code: 'AUTH_ACCOUNT_INACTIVE',
          details: null,
        },
      });
    }

    return user;
  }

  /**
   * Initiate password reset flow.
   * SECURITY: Always returns generic success to prevent user enumeration.
   */
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    // SECURITY: Always return generic success regardless of user existence
    if (!user) {
      return {
        success: true,
        message:
          'If an account exists with this email, a password reset link has been sent',
        data: null,
      };
    }

    // Generate reset token (random string)
    const rawToken = this.generateResetToken();

    // Hash the token before storing (security best practice)
    const hashedToken = await bcrypt.hash(rawToken, 10);

    // Set token expiry to 1 hour from now
    const tokenExpiry = new Date();
    tokenExpiry.setHours(tokenExpiry.getHours() + 1);

    // Store hashed token and expiry
    user.resetToken = hashedToken;
    user.resetTokenExpiry = tokenExpiry;
    await this.userRepository.save(user);

    // Send forgot password email with reset link
    try {
      await this.mailService.sendForgotPasswordEmail(
        user.email,
        user.firstName,
        rawToken,
      );
    } catch (error) {
      this.logger.error('Failed to send forgot password email', error);
      // Don't throw - email failure shouldn't block the response
    }

    return {
      success: true,
      message:
        'If an account exists with this email, a password reset link has been sent',
      data: null,
    };
  }

  /**
   * Reset password using a valid reset token.
   */
  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    // Validate password match first
    validatePasswordMatch(newPassword, confirmPassword);

    // Validate password strength
    validatePasswordStrength(newPassword);

    // Find users with non-null reset tokens
    const users = await this.userRepository.find({
      where: {
        resetToken: Not(IsNull()),
      },
    });

    // Find the user whose hashed token matches the provided token
    let matchedUser: UserEntity | null = null;
    for (const user of users) {
      if (user.resetToken) {
        const isMatch = await bcrypt.compare(token, user.resetToken);
        if (isMatch) {
          matchedUser = user;
          break;
        }
      }
    }

    if (!matchedUser) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid or expired reset token',
        error: {
          code: 'INVALID_TOKEN',
          details: null,
        },
      });
    }

    // Check if token has expired
    if (
      !matchedUser.resetTokenExpiry ||
      new Date() > matchedUser.resetTokenExpiry
    ) {
      // Clear expired token
      matchedUser.resetToken = null;
      matchedUser.resetTokenExpiry = null;
      await this.userRepository.save(matchedUser);

      throw new BadRequestException({
        success: false,
        message:
          'Reset token has expired. Please request a new password reset.',
        error: {
          code: 'TOKEN_EXPIRED',
          details: null,
        },
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    matchedUser.passwordHash = hashedPassword;
    matchedUser.resetToken = null;
    matchedUser.resetTokenExpiry = null;
    matchedUser.isFirstLogin = false;

    await this.userRepository.save(matchedUser);

    // Send password reset confirmation email
    try {
      await this.mailService.sendPasswordResetConfirmation(
        matchedUser.email,
        matchedUser.firstName,
        new Date(),
      );
    } catch (error) {
      this.logger.error(
        'Failed to send password reset confirmation email',
        error,
      );
      // Don't throw - email failure shouldn't block the response
    }

    return {
      success: true,
      message: 'Password has been reset successfully',
      data: null,
    };
  }

  /**
   * Generate a secure random token for password reset
   */
  private generateResetToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  }
}
