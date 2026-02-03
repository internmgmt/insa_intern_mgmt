import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export const AUTH_INVALID_CREDENTIALS = 'AUTH_INVALID_CREDENTIALS';
export const AUTH_INVALID_PASSWORD = 'AUTH_INVALID_PASSWORD';
export const AUTH_ACCOUNT_INACTIVE = 'AUTH_ACCOUNT_INACTIVE';
export const AUTH_PASSWORD_MISMATCH = 'AUTH_PASSWORD_MISMATCH';
export const AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED';
export const AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN';
export const AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND';
export const AUTH_INSUFFICIENT_PERMISSIONS = 'AUTH_INSUFFICIENT_PERMISSIONS';
export const USER_NOT_FOUND = 'USER_NOT_FOUND';
export const USER_EMAIL_EXISTS = 'USER_EMAIL_EXISTS';
export const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';
export const BAD_REQUEST = 'BAD_REQUEST';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = INTERNAL_SERVER_ERROR;
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        const body: any = res;
        if (body.message) message = body.message;
        if (body.error && typeof body.error === 'object' && body.error.code) {
          code = body.error.code;
        }
        details = body.error?.details ?? body.details ?? null;
      }

      if (status === HttpStatus.UNAUTHORIZED && code === INTERNAL_SERVER_ERROR)
        code = AUTH_UNAUTHORIZED;
      if (status === HttpStatus.FORBIDDEN && code === INTERNAL_SERVER_ERROR)
        code = AUTH_INSUFFICIENT_PERMISSIONS;
      if (status === HttpStatus.NOT_FOUND && code === INTERNAL_SERVER_ERROR)
        code = USER_NOT_FOUND;
      if (status === HttpStatus.BAD_REQUEST && code === INTERNAL_SERVER_ERROR)
        code = BAD_REQUEST;
    } else if (exception && typeof exception === 'object') {
      const ex: any = exception;
      if (ex.message) message = ex.message;
    }

    response.status(status).json({
      success: false,
      message,
      data: null,
      error: {
        code,
        message,
        details,
      },
    });
  }
}
