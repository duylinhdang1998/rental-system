import { createHash } from 'node:crypto';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { readCookie } from '../http/cookies.js';
import type { ContextRequest } from '../http/request-context.js';
import { RequestThrottleService } from '../throttle/request-throttle.service.js';
import { THROTTLE_POLICY_KEY } from '../throttle/throttle.decorator.js';
import { policyNameFor, type ThrottlePolicyName } from '../throttle/throttle.policy.js';

const SUBJECT_HASH_LENGTH = 16;
export const THROTTLED_MESSAGE = 'Quá nhiều yêu cầu, vui lòng thử lại sau';

/**
 * Global abuse control (security plan §"Rate limiting"): reads, mutations, logins and exports
 * each have a sliding window keyed by the session when one is presented, else by client IP.
 * It runs before authentication so unauthenticated floods are cut off as early as possible.
 */
@Injectable()
export class RequestThrottleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly throttle: RequestThrottleService,
    @Inject(ENVIRONMENT) private readonly environment: Environment,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest<ContextRequest>();
    const response = http.getResponse<Response>();
    const explicit = this.reflector.getAllAndOverride<ThrottlePolicyName | undefined>(
      THROTTLE_POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );
    const policy = policyNameFor(request.method, explicit);
    const decision = this.throttle.check(policy, this.subject(request, policy));
    response.setHeader('x-ratelimit-limit', String(decision.limit));
    response.setHeader('x-ratelimit-remaining', String(decision.remaining));
    if (decision.allowed) return true;
    response.setHeader('retry-after', String(decision.retryAfterSeconds));
    throw new HttpException(THROTTLED_MESSAGE, HttpStatus.TOO_MANY_REQUESTS);
  }

  /** Never keys on the raw session token: a short hash prefix is enough to separate sessions. */
  private subject(request: ContextRequest, policy: ThrottlePolicyName): string {
    const ip = request.ip ?? 'unknown';
    if (policy === 'login') return `ip:${ip}`;
    const sessionToken = readCookie(request, this.environment.SESSION_COOKIE_NAME);
    if (!sessionToken) return `ip:${ip}`;
    const digest = createHash('sha256').update(sessionToken).digest('hex');
    return `session:${digest.slice(0, SUBJECT_HASH_LENGTH)}`;
  }
}
