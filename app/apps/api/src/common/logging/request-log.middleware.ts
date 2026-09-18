import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import type { NextFunction, Request, Response } from 'express';
import type { ContextRequest } from '../http/request-context.js';
import type { LogLevel, StructuredLogger } from './structured-logger.js';

const CLIENT_ERROR = 400;
const SERVER_ERROR = 500;

function levelFor(status: number): LogLevel {
  if (status >= SERVER_ERROR) return 'error';
  return status >= CLIENT_ERROR ? 'warn' : 'info';
}

/** The matched route template (no query string, no ids) is what dashboards group by. */
function routeOf(request: Request): string {
  const template = (request as { route?: { path?: string } }).route?.path;
  return template ? `${request.baseUrl}${template}` : request.path;
}

/**
 * Assigns the request identifier before any guard runs and writes one structured line when the
 * response finishes, so throttled, unauthenticated and failed requests are logged too.
 * Bodies, headers and query strings are never logged.
 */
export function createRequestLogMiddleware(logger: StructuredLogger) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const context = request as ContextRequest;
    const startedAt = performance.now();
    context.requestId ??= `req_${randomUUID()}`;
    response.setHeader('x-request-id', context.requestId);
    response.on('finish', () => {
      logger.log({
        actorId: context.authenticatedUser?.id ?? null,
        clientIp: request.ip ?? 'unknown',
        durationMs: Math.round(performance.now() - startedAt),
        event: 'http.request',
        level: levelFor(response.statusCode),
        method: request.method,
        requestId: context.requestId,
        route: routeOf(request),
        status: response.statusCode,
      });
    });
    next();
  };
}
