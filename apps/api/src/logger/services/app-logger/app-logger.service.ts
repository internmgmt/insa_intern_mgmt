import { Inject, Injectable, LoggerService } from '@nestjs/common';
import pino, { Logger, LoggerOptions } from 'pino';
import { AsyncLocalStorage } from 'async_hooks';
import { ASYNC_STORAGE } from 'src/global/constants';
import { ConfigService } from '@nestjs/config';
import { AppEnv } from 'src/services/app-config/configuration';

@Injectable()
export class AppLoggerService implements LoggerService {
  private pino: Logger;

  constructor(
    @Inject(ASYNC_STORAGE)
    private readonly asyncStorage: AsyncLocalStorage<Map<string, string>>,
    private readonly configService: ConfigService,
  ) {
    const logLevel = configService.get('logLevel');
    const appEnv = configService.get<AppEnv>('appEnv');

    const loggerConfig: LoggerOptions = {
      level: logLevel,
    };

    if (appEnv === AppEnv.DEV) {
      loggerConfig.transport = {
        target: 'pino-pretty',
      };
    }

    this.pino = pino(loggerConfig);
  }

  private sanitize(msg: any): string {
    if (typeof msg !== 'string') return String(msg);
    return msg.replace(/[\r\n\t]/g, ' ').replace(/[\x00-\x1F\x7F]/g, '');
  }

  error(message: any, trace?: string, context?: string): any {
    const traceId = this.asyncStorage.getStore()?.get('traceId');
    this.pino.error(
      { traceId, context },
      this.sanitize(this.getMessage(message, context)),
    );
    if (trace) {
      this.pino.error({ traceId, context }, this.sanitize(trace));
    }
  }

  log(message: any, context?: string): any {
    const traceId = this.asyncStorage.getStore()?.get('traceId');
    this.pino.info(
      { traceId },
      this.sanitize(this.getMessage(message, context)),
    );
  }

  warn(message: any, context?: string): any {
    const traceId = this.asyncStorage.getStore()?.get('traceId');
    this.pino.warn(
      { traceId },
      this.sanitize(this.getMessage(message, context)),
    );
  }

  private getMessage(message: any, context?: string) {
    return context ? `[${context}] ${message}` : message;
  }
}