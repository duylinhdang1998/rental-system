import { SetMetadata } from '@nestjs/common';
import type { ThrottlePolicyName } from './throttle.policy.js';

export const THROTTLE_POLICY_KEY = 'throttle:policy';

/** Overrides the method-based default (read/mutation) for a route or controller. */
export const ThrottlePolicy = (name: ThrottlePolicyName) => SetMetadata(THROTTLE_POLICY_KEY, name);
