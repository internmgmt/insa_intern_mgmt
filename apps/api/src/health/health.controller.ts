import { Controller, Get, Optional } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { CacheHealthIndicator } from './indicators/cache/cache.health-indicator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    @Optional() private readonly cacheHealthIndicator?: CacheHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    const checks: Array<() => Promise<any>> = [
      () => this.db.pingCheck('db'),
    ];

    if (this.cacheHealthIndicator) {
      checks.push(() => this.cacheHealthIndicator!.isHealthy());
    }

    return this.health.check(checks);
  }
}
