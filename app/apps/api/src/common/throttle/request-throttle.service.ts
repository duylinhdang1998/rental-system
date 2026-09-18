import { Inject, Injectable } from '@nestjs/common';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { SecurityEventService } from '../../modules/auth/security-event.service.js';
import {
  buildPolicies,
  SlidingWindowCounter,
  type ThrottleDecision,
  type ThrottlePolicy,
  type ThrottlePolicyName,
} from './throttle.policy.js';

const PRUNE_EVERY_HITS = 500;

@Injectable()
export class RequestThrottleService {
  private readonly counter = new SlidingWindowCounter();
  private readonly enabled: boolean;
  private readonly policies: Record<ThrottlePolicyName, ThrottlePolicy>;
  private hitsSincePrune = 0;

  constructor(
    @Inject(ENVIRONMENT) environment: Environment,
    private readonly securityEvents: SecurityEventService,
  ) {
    this.enabled = environment.RATE_LIMIT_ENABLED;
    this.policies = buildPolicies({
      exportPerTenMinutes: environment.RATE_LIMIT_EXPORT_PER_TEN_MINUTES,
      loginPerMinute: environment.RATE_LIMIT_LOGIN_PER_MINUTE,
      mutationPerMinute: environment.RATE_LIMIT_MUTATION_PER_MINUTE,
      readPerMinute: environment.RATE_LIMIT_READ_PER_MINUTE,
    });
  }

  policy(name: ThrottlePolicyName): ThrottlePolicy {
    return this.policies[name];
  }

  check(name: ThrottlePolicyName, subject: string, now = Date.now()): ThrottleDecision {
    const policy = this.policies[name];
    if (!this.enabled) {
      return { allowed: true, limit: policy.limit, remaining: policy.limit, retryAfterSeconds: 0 };
    }
    this.pruneIfDue(now);
    const decision = this.counter.hit(`${name}:${subject}`, policy, now);
    if (!decision.allowed) this.securityEvents.recordThrottle(subject, name);
    return decision;
  }

  private pruneIfDue(now: number): void {
    this.hitsSincePrune += 1;
    if (this.hitsSincePrune < PRUNE_EVERY_HITS) return;
    this.hitsSincePrune = 0;
    const widest = Math.max(...Object.values(this.policies).map((policy) => policy.windowMs));
    this.counter.prune(widest, now);
  }
}
