import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheConfigService } from './services/cache-config/cache-config.service';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useClass: CacheConfigService,
      isGlobal: true,
    }),
  ],
  providers: [CacheConfigService],
  exports: [CacheModule],
})
export class AppCacheModule {}
