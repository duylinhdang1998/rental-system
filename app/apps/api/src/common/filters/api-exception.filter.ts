import { randomUUID } from 'node:crypto';
import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ContextRequest } from '../http/request-context.js';
import { AuthError, type AuthErrorCode } from '../../modules/auth/auth.errors.js';
import { DomainError, type DomainErrorCode } from '../errors/domain.error.js';

interface ErrorResponseBody {
  error: { code: string; message: string };
  message: string;
  requestId: string;
  statusCode: number;
}

const AUTH_ERROR_STATUS: Record<AuthErrorCode, HttpStatus> = {
  ACCOUNT_UNAVAILABLE: HttpStatus.UNAUTHORIZED,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  RATE_LIMITED: HttpStatus.TOO_MANY_REQUESTS,
  SESSION_INVALID: HttpStatus.UNAUTHORIZED,
};

const DOMAIN_ERROR_STATUS: Record<DomainErrorCode, HttpStatus> = {
  CONFLICT: HttpStatus.CONFLICT,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  INVALID_INPUT: HttpStatus.BAD_REQUEST,
  INVALID_TRANSITION: HttpStatus.CONFLICT,
  NOT_FOUND: HttpStatus.NOT_FOUND,
};

function errorStatus(exception: unknown): HttpStatus {
  if (exception instanceof AuthError) return AUTH_ERROR_STATUS[exception.code];
  if (exception instanceof DomainError) return DOMAIN_ERROR_STATUS[exception.code];
  if (exception instanceof HttpException) return exception.getStatus();
  return HttpStatus.INTERNAL_SERVER_ERROR;
}

function exceptionMessage(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === 'string') return response;
  if (typeof response === 'object' && response && 'message' in response) {
    const message = response.message;
    return Array.isArray(message) ? message.join(', ') : String(message);
  }
  return 'Yêu cầu không hợp lệ';
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<ContextRequest>();
    const response = context.getResponse<Response>();
    const statusCode = errorStatus(exception);
    const message =
      exception instanceof AuthError || exception instanceof DomainError
        ? exception.message
        : exception instanceof HttpException
          ? exceptionMessage(exception)
          : 'Đã có lỗi xảy ra';
    const body: ErrorResponseBody = {
      error: {
        code:
          exception instanceof AuthError || exception instanceof DomainError
            ? exception.code
            : (HttpStatus[statusCode] ?? 'INTERNAL_SERVER_ERROR'),
        message,
      },
      message,
      requestId: request.requestId ?? `req_${randomUUID()}`,
      statusCode,
    };
    response.status(statusCode).json(body);
  }
}
