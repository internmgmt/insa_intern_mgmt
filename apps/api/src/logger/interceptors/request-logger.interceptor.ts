import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { maskSensitiveData } from '../../common/utils/security.util';

@Injectable()
export class RequestLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const query = request.query;
    const body = request.body;

    const logMessage = {
      message: `${method} ${url} REQUEST`,
      query: maskSensitiveData(query),
      body: maskSensitiveData(body),
    };

    this.logger.log(JSON.stringify(logMessage));

    return next.handle();
  }
}
