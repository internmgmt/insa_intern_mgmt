import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'CurrentPassword@123',
    description: 'Current password',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'New password (minimum 8 characters)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'New password must be at least 8 characters long',
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  newPassword: string;

  @ApiProperty({
    example: 'NewPassword@123',
    description: 'Confirm password (must match new password)',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
