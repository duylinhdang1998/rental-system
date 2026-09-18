import { Inject, Injectable } from '@nestjs/common';
import {
  BUSINESS_TIME_ZONE,
  MILLISECONDS_PER_DAY,
  businessDayKey,
  monthEnd,
  monthKey,
  monthsEnding,
  type PnlQuery,
  type PnlReport,
} from '@rental/contracts';
import { CONTRACT_REPOSITORY } from '../contracts/contract.tokens.js';
import type { ContractRepository } from '../contracts/contract.types.js';
import { ECONOMICS_REPOSITORY } from '../economics/economics.tokens.js';
import type { EconomicsRepository } from '../economics/economics.types.js';
import { dayStart } from '../finance/report-range.js';
import { pnlMonths, pnlTotals } from './pnl.policy.js';
import { eventsInWindow, revenueEvents, type EventWindow } from './revenue-events.policy.js';

/** Inclusive month span as an instant window in the business time zone. */
export function monthWindow(from: string, to: string): EventWindow {
  const lastDay = dayStart(monthEnd(to));
  return {
    endAt: new Date(lastDay.getTime() + MILLISECONDS_PER_DAY),
    startAt: dayStart(`${from}-01`),
  };
}

/** US-029 / BR-08: revenue − expenses − depreciation per month (Owner only). */
@Injectable()
export class PnlService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contracts: ContractRepository,
    @Inject(ECONOMICS_REPOSITORY) private readonly economics: EconomicsRepository,
  ) {}

  async report(query: PnlQuery, now = new Date()): Promise<PnlReport> {
    const to = query.to ?? monthKey(businessDayKey(now));
    const months = monthsEnding(to, query.months);
    const from = months[0] ?? to;
    const window = monthWindow(from, to);
    const [contracts, acquisitions, expenses] = await Promise.all([
      this.contracts.listFinancial(),
      this.economics.listAcquisitions(),
      this.economics.listExpenses({ from: `${from}-01`, to: monthEnd(to) }),
    ]);
    const rows = pnlMonths({
      acquisitions,
      events: eventsInWindow(revenueEvents(contracts), window),
      expenses,
      months,
    });
    return {
      from,
      generatedAt: now.toISOString(),
      months: rows,
      timeZone: BUSINESS_TIME_ZONE,
      to,
      totals: pnlTotals(rows),
    };
  }
}
