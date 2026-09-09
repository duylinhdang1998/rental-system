import { Inject, Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';
import { ContractLifecycleService } from './contract-lifecycle.service.js';
import { OVERDUE_SCHEDULER_ENABLED } from './contract.tokens.js';

const OVERDUE_CHECK_INTERVAL_MS = 60_000;

/** In-process scheduler; the evaluation itself is idempotent so overlapping ticks are harmless. */
@Injectable()
export class OverdueScheduler implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | undefined;

  constructor(
    private readonly lifecycle: ContractLifecycleService,
    @Inject(OVERDUE_SCHEDULER_ENABLED) private readonly enabled: boolean,
  ) {}

  onModuleInit(): void {
    if (!this.enabled) return;
    void this.tick();
    this.timer = setInterval(() => void this.tick(), OVERDUE_CHECK_INTERVAL_MS);
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private async tick(): Promise<void> {
    try {
      await this.lifecycle.evaluateOverdue();
    } catch (error) {
      console.warn('Overdue evaluation failed', error instanceof Error ? error.message : error);
    }
  }
}
