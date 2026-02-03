import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { CacheConfig } from 'src/services/app-config/configuration';
import { redisStore } from 'cache-manager-redis-yet';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    const { host, port, password } = this.configService.get<CacheConfig>(
      'cache',
    ) as CacheConfig;

    return {
      stores: [
        await redisStore({
          socket: {
            host,
            port,
          },
          password: password || undefined,
        }),
      ],
    };
  }
}
