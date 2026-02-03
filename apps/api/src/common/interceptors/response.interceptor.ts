import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

function isPlainObject(v: any): v is Record<string, any> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function transformValue(value: any): any {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(transformValue);
  if (isPlainObject(value)) return transformEntity(value);
  return value;
}

function transformEntity(obj: any): any {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(transformEntity);
  if (!isPlainObject(obj)) return obj;
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = transformValue(v);
  }
  return out;
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<any>> {
    return next.handle().pipe(
      map((data) => {
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          ('data' in data || 'error' in data)
        ) {
          return data as ApiResponse<any>;
        }

        if (
          data &&
          typeof data === 'object' &&
          'items' in data &&
          'pagination' in data
        ) {
          return {
            success: true,
            message: null,
            data: {
              items: transformEntity((data as any).items),
              pagination: (data as any).pagination,
            },
            error: null,
          } as ApiResponse<any>;
        }

        if (Array.isArray(data)) {
          return {
            success: true,
            message: null,
            data: transformEntity(data),
            error: null,
          } as ApiResponse<any>;
        }

        if (
          isPlainObject(data) &&
          ('id' in data || 'createdAt' in data || 'created_at' in data)
        ) {
          return {
            success: true,
            message: null,
            data: transformEntity(data),
            error: null,
          } as ApiResponse<any>;
        }

        return {
          success: true,
          message: null,
          data: data === undefined ? null : data,
          error: null,
        } as ApiResponse<any>;
      }),
    );
  }
}
