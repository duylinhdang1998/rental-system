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
import type { StructuredLogger } from '../logging/structured-logger.js';

interface ErrorResponseBody {
  error: { code: string; message: string };
  message: string;
  requestId: string;
  statusCode: number;
}

/** Errors raised by the body parser before Nest sees the request (413, malformed JSON). */
interface ParserError {
  status: number;
  type: string;
}

const AUTH_ERROR_STATUS: Record<AuthErrorCode, HttpStatus> = {
  ACCOUNT_UNAVAILABLE: HttpStatus.UNAUTHORIZED,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  RATE_LIMITED: HttpStatus.TOO_MANY_REQUESTS,
  SESSION_INVALID: HttpStatus.UNAUTHORIZED,
};

const DOMAIN_ERROR_STATUS: Record<DomainErrorCode, HttpStatus> = {
  CASH_SHIFT_ALREADY_OPEN: HttpStatus.CONFLICT,
  CASH_SHIFT_NOTE_REQUIRED: HttpStatus.BAD_REQUEST,
  CASH_SHIFT_NOT_OPEN: HttpStatus.CONFLICT,
  CONFLICT: HttpStatus.CONFLICT,
  CONTRACT_NOT_SETTLED: HttpStatus.CONFLICT,
  DAMAGE_ITEM_EXISTS: HttpStatus.CONFLICT,
  DAMAGE_ITEM_INACTIVE: HttpStatus.CONFLICT,
  DAMAGE_ITEM_NOT_FOUND: HttpStatus.NOT_FOUND,
  DEPOSIT_ALREADY_REFUNDED: HttpStatus.CONFLICT,
  FORBIDDEN: HttpStatus.FORBIDDEN,
  INVALID_INPUT: HttpStatus.BAD_REQUEST,
  INVALID_TRANSITION: HttpStatus.CONFLICT,
  NOT_FOUND: HttpStatus.NOT_FOUND,
  NO_DEPOSIT_REFUND_DUE: HttpStatus.CONFLICT,
  TOO_MANY_FILES: HttpStatus.BAD_REQUEST,
  UNSUPPORTED_FILE: HttpStatus.BAD_REQUEST,
};

const PARSER_MESSAGES: Partial<Record<number, string>> = {
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'Yêu cầu quá lớn',
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: 'Định dạng yêu cầu không được hỗ trợ',
};

const CLIENT_ERROR_RANGE = { max: 500, min: 400 };

function isParserError(exception: unknown): exception is ParserError {
  if (typeof exception !== 'object' || exception === null) return false;
  const candidate = exception as Partial<ParserError>;
  return (
    typeof candidate.status === 'number' &&
    candidate.status >= CLIENT_ERROR_RANGE.min &&
    candidate.status < CLIENT_ERROR_RANGE.max &&
    typeof candidate.type === 'string'
  );
}

function errorStatus(exception: unknown): HttpStatus {
  if (exception instanceof AuthError) return AUTH_ERROR_STATUS[exception.code];
  if (exception instanceof DomainError) return DOMAIN_ERROR_STATUS[exception.code];
  if (exception instanceof HttpException) return exception.getStatus();
  if (isParserError(exception)) return exception.status;
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

function safeMessage(exception: unknown, statusCode: HttpStatus): string {
  if (exception instanceof AuthError || exception instanceof DomainError) return exception.message;
  if (exception instanceof HttpException) return exceptionMessage(exception);
  if (isParserError(exception)) return PARSER_MESSAGES[statusCode] ?? 'Yêu cầu không hợp lệ';
  return 'Đã có lỗi xảy ra';
}

function errorCode(exception: unknown, statusCode: HttpStatus): string {
  if (exception instanceof AuthError || exception instanceof DomainError) return exception.code;
  return HttpStatus[statusCode] ?? 'INTERNAL_SERVER_ERROR';
}

/** Normalizes every failure to one body shape; unexpected errors are logged with their stack. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger?: StructuredLogger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<ContextRequest>();
    const response = context.getResponse<Response>();
    const statusCode = errorStatus(exception);
    const message = safeMessage(exception, statusCode);
    const requestId = request.requestId ?? `req_${randomUUID()}`;
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) this.logUnexpected(exception, requestId);
    const body: ErrorResponseBody = {
      error: { code: errorCode(exception, statusCode), message },
      message,
      requestId,
      statusCode,
    };
    response.status(statusCode).json(body);
  }

  private logUnexpected(exception: unknown, requestId: string): void {
    this.logger?.log({
      event: 'http.error',
      level: 'error',
      message: exception instanceof Error ? exception.message : String(exception),
      requestId,
      stack: exception instanceof Error ? exception.stack : undefined,
    });
  }
}
