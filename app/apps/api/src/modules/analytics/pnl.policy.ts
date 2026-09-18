import {
  businessDayKey,
  depreciationAt,
  monthEnd,
  monthKey,
  previousMonth,
  type PnlMonth,
  type PnlTotals,
  type VehicleAcquisition,
} from '@rental/contracts';
import type { ExpenseRecord } from '../economics/economics.types.js';
import { signedExpenseVnd } from '../economics/expense.policy.js';
import type { RevenueEvent } from './revenue-events.policy.js';

export interface PnlInputs {
  acquisitions: readonly VehicleAcquisition[];
  events: readonly RevenueEvent[];
  expenses: readonly ExpenseRecord[];
  months: readonly string[];
}

function addTo(map: Map<string, number>, month: string, amount: number): void {
  map.set(month, (map.get(month) ?? 0) + amount);
}

/** Revenue by the business month of each accrual (line start, charge creation, activation). */
export function monthlyRevenue(events: readonly RevenueEvent[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const event of events) addTo(out, monthKey(businessDayKey(event.at)), event.vnd);
  return out;
}

/** Expenses by paid month; reversals subtract (BR-09). */
export function monthlyExpenses(expenses: readonly ExpenseRecord[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const expense of expenses) addTo(out, monthKey(expense.paidOn), signedExpenseVnd(expense));
  return out;
}

/**
 * Straight-line depreciation booked in one month: the accumulated figure at the month end minus
 * the figure at the previous month end, so the sum over any span equals `depreciationAt`.
 */
export function monthlyDepreciation(
  acquisitions: readonly VehicleAcquisition[],
  month: string,
): number {
  const end = monthEnd(month);
  const priorEnd = monthEnd(previousMonth(month));
  return acquisitions.reduce(
    (sum, acquisition) =>
      sum +
      depreciationAt(acquisition, end).accumulatedDepreciationVnd -
      depreciationAt(acquisition, priorEnd).accumulatedDepreciationVnd,
    0,
  );
}

export function pnlMonths(inputs: PnlInputs): PnlMonth[] {
  const revenue = monthlyRevenue(inputs.events);
  const expenses = monthlyExpenses(inputs.expenses);
  return inputs.months.map((month) => {
    const revenueVnd = revenue.get(month) ?? 0;
    const expensesVnd = expenses.get(month) ?? 0;
    const depreciationVnd = monthlyDepreciation(inputs.acquisitions, month);
    return {
      depreciationVnd,
      expensesVnd,
      month,
      profitVnd: revenueVnd - expensesVnd - depreciationVnd,
      revenueVnd,
    };
  });
}

export function pnlTotals(rows: readonly PnlMonth[]): PnlTotals {
  return rows.reduce(
    (totals, row) => ({
      depreciationVnd: totals.depreciationVnd + row.depreciationVnd,
      expensesVnd: totals.expensesVnd + row.expensesVnd,
      profitVnd: totals.profitVnd + row.profitVnd,
      revenueVnd: totals.revenueVnd + row.revenueVnd,
    }),
    { depreciationVnd: 0, expensesVnd: 0, profitVnd: 0, revenueVnd: 0 },
  );
}
