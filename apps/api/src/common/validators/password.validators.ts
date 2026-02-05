import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

const PASSWORD_MIN_LENGTH = 12;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  'password1',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'abc123456',
  'password!',
  'password1!',
  'welcome123',
  'letmein123',
  'admin123456',
  'user12345678',
  'password!@#',
  'qwerty!@#$',
  '123456!@#$',
  'admin!@#456',
]);

export function validatePasswordStrength(password: string): void {
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    throw new BadRequestException({
      success: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`,
      error: {
        code: 'WEAK_PASSWORD',
        details: {
          requirement: 'length',
          minimum: PASSWORD_MIN_LENGTH,
        },
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
        details: {
          requirement: 'complexity',
          rules: {
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password),
          },
        },
      },
    });
  }

  const passwordLower = password.toLowerCase();

  if (COMMON_PASSWORDS.has(passwordLower)) {
    throw new BadRequestException({
      success: false,
      message:
        'This password is too common and easily guessed. Please choose a more unique password.',
      error: {
        code: 'WEAK_PASSWORD',
        details: {
          requirement: 'uniqueness',
          reason: 'common_password',
        },
      },
    });
  }

  if (isSimplePattern(password)) {
    throw new BadRequestException({
      success: false,
      message:
        'Password contains simple patterns and is too predictable. Please choose a more complex password.',
      error: {
        code: 'WEAK_PASSWORD',
        details: {
          requirement: 'complexity',
          reason: 'simple_pattern',
        },
      },
    });
  }

  const entropy = calculatePasswordEntropy(password);
  const MIN_ENTROPY = 50;

  if (entropy < MIN_ENTROPY) {
    throw new BadRequestException({
      success: false,
      message:
        'Password is not complex enough. Please use a mix of different character types and avoid predictable patterns.',
      error: {
        code: 'WEAK_PASSWORD',
        details: {
          requirement: 'entropy',
          calculated: Math.round(entropy),
          minimum: MIN_ENTROPY,
        },
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
        code: 'PASSWORD_MISMATCH',
        details: null,
      },
    });
  }
}

function isSimplePattern(password: string): boolean {
  const repeatedChar = /(.)\1{7,}/.test(password);
  if (repeatedChar) return true;

  const sequences = [
    '01234567890',
    'abcdefghijklmnopqrstuvwxyz',
    'qwertyuiopasdfghjklzxcvbnm',
  ];

  for (const seq of sequences) {
    if (seq.includes(password.toLowerCase().substring(0, 8))) return true;
    if (
      seq
        .split('')
        .reverse()
        .join('')
        .includes(password.toLowerCase().substring(0, 8))
    )
      return true;
  }

  for (let len = 2; len <= password.length / 2; len++) {
    const pattern = password.substring(0, len);
    const repeated = pattern
      .repeat(Math.ceil(password.length / len))
      .substring(0, password.length);
    if (password === repeated) return true;
  }

  return false;
}

function calculatePasswordEntropy(password: string): number {
  let charSetSize = 0;

  if (/[a-z]/.test(password)) charSetSize += 26;
  if (/[A-Z]/.test(password)) charSetSize += 26;
  if (/\d/.test(password)) charSetSize += 10;
  if (/[@$!%*?&]/.test(password)) charSetSize += 7;
  if (/[^a-zA-Z\d@$!%*?&]/.test(password)) charSetSize += 20;

  const entropy = password.length * Math.log2(charSetSize);

  return entropy;
}
