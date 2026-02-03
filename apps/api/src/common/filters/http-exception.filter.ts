import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

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

export const STUDENT_ID_EXISTS = 'STUDENT_ID_EXISTS';
export const STUDENT_NOT_FOUND = 'STUDENT_NOT_FOUND';
export const STUDENT_INVALID_ACADEMIC_YEAR = 'STUDENT_INVALID_ACADEMIC_YEAR';
export const STUDENT_ALREADY_REVIEWED = 'STUDENT_ALREADY_REVIEWED';
export const STUDENT_NOT_EDITABLE = 'STUDENT_NOT_EDITABLE';
export const STUDENT_NOT_OWNED = 'STUDENT_NOT_OWNED';
export const APPLICATION_NOT_FOUND = 'APPLICATION_NOT_FOUND';
export const APPLICATION_NOT_EDITABLE = 'APPLICATION_NOT_EDITABLE';
export const APPLICATION_NOT_SUBMITTABLE = 'APPLICATION_NOT_SUBMITTABLE';
export const APPLICATION_NOT_OWNED = 'APPLICATION_NOT_OWNED';
export const INTERN_NOT_FOUND = 'INTERN_NOT_FOUND';
export const INTERN_INVALID_STATUS = 'INTERN_INVALID_STATUS';
export const INTERN_NOT_ACTIVE = 'INTERN_NOT_ACTIVE';
export const INTERN_NOT_COMPLETED = 'INTERN_NOT_COMPLETED';
export const CERTIFICATE_ALREADY_ISSUED = 'CERTIFICATE_ALREADY_ISSUED';
export const SUPERVISOR_WRONG_DEPARTMENT = 'SUPERVISOR_WRONG_DEPARTMENT';
export const INVALID_CERTIFICATE_URL = 'INVALID_CERTIFICATE_URL';
export const STUDENT_ID_IMMUTABLE = 'STUDENT_ID_IMMUTABLE';
export const STUDENT_NOT_ARRIVED = 'STUDENT_NOT_ARRIVED';
export const INVALID_TOKEN = 'INVALID_TOKEN';
export const TOKEN_EXPIRED = 'TOKEN_EXPIRED';
export const PASSWORD_MISMATCH = 'PASSWORD_MISMATCH';
export const DEPARTMENT_NOT_FOUND = 'DEPARTMENT_NOT_FOUND';
export const DEPARTMENT_NAME_EXISTS = 'DEPARTMENT_NAME_EXISTS';
export const DOCUMENT_NOT_OWNED = 'DOCUMENT_NOT_OWNED';
export const DOCUMENT_TYPE_NOT_ALLOWED = 'DOCUMENT_TYPE_NOT_ALLOWED';
export const UNIVERSITY_NOT_OWNED = 'UNIVERSITY_NOT_OWNED';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

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
      if (status === HttpStatus.NOT_FOUND && code === INTERNAL_SERVER_ERROR) {
        if (typeof message === 'string') {
          if (/student/i.test(message)) code = STUDENT_NOT_FOUND;
          else if (/application/i.test(message)) code = APPLICATION_NOT_FOUND;
          else if (/intern/i.test(message)) code = INTERN_NOT_FOUND;
          else code = USER_NOT_FOUND;
        } else {
          code = USER_NOT_FOUND;
        }
      }
      if (status === HttpStatus.CONFLICT && code === INTERNAL_SERVER_ERROR) {
        if (
          typeof message === 'string' &&
          /student\s.*studentid|student id|studentId/i.test(message)
        )
          code = STUDENT_ID_EXISTS;
        else code = USER_EMAIL_EXISTS;
      }
      if (status === HttpStatus.BAD_REQUEST && code === INTERNAL_SERVER_ERROR) {
        if (typeof message === 'string') {
          if (/academic\s*year/i.test(message))
            code = STUDENT_INVALID_ACADEMIC_YEAR;
          else if (
            /cannot\s+be\s+submitted|submit\s+for\s+review/i.test(message)
          )
            code = APPLICATION_NOT_SUBMITTABLE;
          else if (
            /invalid\s+supervisor|supervisor\s+not\s+found/i.test(message)
          )
            code = INTERN_INVALID_STATUS;
          else if (/must\s+be\s+ACTIVE\s+to\s+complete/i.test(message))
            code = INTERN_NOT_ACTIVE;
          else if (
            /must\s+be\s+COMPLETED\s+to\s+issue\s+certificate/i.test(message)
          )
            code = INTERN_NOT_COMPLETED;
          else if (/certificate\s+already\s+issued/i.test(message))
            code = CERTIFICATE_ALREADY_ISSUED;
          else if (
            /supervisor.*same\s+department|supervisor\s+not\s+in\s+same\s+department/i.test(
              message,
            )
          )
            code = SUPERVISOR_WRONG_DEPARTMENT;
          else if (
            /invalid\s+certificate\s+URL|certificate\s+URL/i.test(message)
          )
            code = INVALID_CERTIFICATE_URL;
          else code = BAD_REQUEST;
        } else code = BAD_REQUEST;
      }
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
