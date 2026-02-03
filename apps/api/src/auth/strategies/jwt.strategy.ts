import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret') as string,
    });
  }

  async validate(payload: any) {
    try {
      const user = await this.authService.validateUser(payload);

      // Ensure role is uppercase for consistency
      const normalizedRole = user.role ? String(user.role).toUpperCase() : null;

      return {
        id: user.id,
        email: user.email,
        role: normalizedRole,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        departmentId: user.departmentId || null,
        universityId: user.universityId || null,
      };
    } catch (error) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid token',
        error: {
          code: 'AUTH_INVALID_TOKEN',
          details: null,
        },
      });
    }
  }
}
