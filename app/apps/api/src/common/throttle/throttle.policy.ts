import { MILLISECONDS_PER_MINUTE } from '../time.js';

export type ThrottlePolicyName = 'export' | 'login' | 'mutation' | 'read';

export interface ThrottlePolicy {
  limit: number;
  windowMs: number;
}

export interface ThrottleDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export interface ThrottleLimits {
  exportPerTenMinutes: number;
  loginPerMinute: number;
  mutationPerMinute: number;
  readPerMinute: number;
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXPORT_WINDOW_MINUTES = 10;
const MILLISECONDS_PER_SECOND = 1000;

/** Explicit route policies win; otherwise safe methods are reads and everything else mutates. */
export function policyNameFor(method: string, explicit?: ThrottlePolicyName): ThrottlePolicyName {
  if (explicit) return explicit;
  return SAFE_METHODS.has(method.toUpperCase()) ? 'read' : 'mutation';
}

export function buildPolicies(limits: ThrottleLimits): Record<ThrottlePolicyName, ThrottlePolicy> {
  return {
    export: {
      limit: limits.exportPerTenMinutes,
      windowMs: EXPORT_WINDOW_MINUTES * MILLISECONDS_PER_MINUTE,
    },
    login: { limit: limits.loginPerMinute, windowMs: MILLISECONDS_PER_MINUTE },
    mutation: { limit: limits.mutationPerMinute, windowMs: MILLISECONDS_PER_MINUTE },
    read: { limit: limits.readPerMinute, windowMs: MILLISECONDS_PER_MINUTE },
  };
}

/** Sliding-window counter: a key may make `limit` hits in any trailing `windowMs`. */
export class SlidingWindowCounter {
  private readonly hits = new Map<string, number[]>();

  hit(key: string, policy: ThrottlePolicy, now = Date.now()): ThrottleDecision {
    const windowStart = now - policy.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((at) => at > windowStart);
    if (recent.length >= policy.limit) {
      this.hits.set(key, recent);
      const retryAfterMs = (recent[0] ?? now) + policy.windowMs - now;
      return {
        allowed: false,
        limit: policy.limit,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / MILLISECONDS_PER_SECOND)),
      };
    }
    recent.push(now);
    this.hits.set(key, recent);
    return {
      allowed: true,
      limit: policy.limit,
      remaining: policy.limit - recent.length,
      retryAfterSeconds: 0,
    };
  }

  /** Drops keys whose hits all fell out of the widest window so memory stays bounded. */
  prune(maxWindowMs: number, now = Date.now()): void {
    for (const [key, times] of this.hits) {
      const recent = times.filter((at) => at > now - maxWindowMs);
      if (recent.length === 0) this.hits.delete(key);
      else this.hits.set(key, recent);
    }
  }

  size(): number {
    return this.hits.size;
  }
}
