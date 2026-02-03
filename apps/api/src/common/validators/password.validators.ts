import { BadRequestException } from '@nestjs/common';
import { PASSWORD_MISMATCH } from '../filters/http-exception.filter';

/**
 * Password strength rules:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function validatePasswordStrength(password: string): void {
  if (!password || password.length < 8) {
    throw new BadRequestException({
      success: false,
      message: 'Password must be at least 8 characters long',
      error: {
        code: 'WEAK_PASSWORD',
        details: null,
      },
    });
  }

  if (!PASSWORD_REGEX.test(password)) {
    throw new BadRequestException({
      success: false,
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      error: {
        code: 'WEAK_PASSWORD',
        details: null,
      },
    });
  }
}

export function validatePasswordMatch(
  password: string,
  confirmPassword: string,
): void {
  if (password !== confirmPassword) {
    throw new BadRequestException({
      success: false,
      message: 'Password and confirm password do not match',
      error: {
        code: PASSWORD_MISMATCH,
        details: null,
      },
    });
  }
}
