import { randomUUID } from 'node:crypto';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Observable } from 'rxjs';
import type { ContextRequest } from '../http/request-context.js';

/**
 * Guarantees a request identifier for handlers even when the logging middleware is not mounted
 * (unit harnesses); when it is, the identifier assigned there is kept.
 */
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<ContextRequest>();
    const response = context
      .switchToHttp()
      .getResponse<{ setHeader(name: string, value: string): void }>();
    request.requestId ??= `req_${randomUUID()}`;
    response.setHeader('x-request-id', request.requestId);
    return next.handle();
  }
}
