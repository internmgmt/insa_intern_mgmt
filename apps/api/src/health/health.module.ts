import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
// Make CacheHealthIndicator optional in dev: comment out provider when cache is disabled

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
