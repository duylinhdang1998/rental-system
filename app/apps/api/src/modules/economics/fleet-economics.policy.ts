import {
  breakEvenProjection,
  depreciationAt,
  recoveredPercent,
  type ContractCharge,
  type FleetEconomicsRow,
  type FleetEconomicsTotals,
  type RentalContract,
  type Vehicle,
  type VehicleAcquisition,
} from '@rental/contracts';
import { signedExpenseVnd } from './expense.policy.js';
import type { ExpenseRecord } from './economics.types.js';

/** Cumulative figure plus the part that falls inside the trailing window. */
export interface Accrual {
  trailingVnd: number;
  vnd: number;
}

export interface VehicleRevenue extends Accrual {
  rentalDays: number;
}

export interface AttributedRevenue {
  byVehicle: Map<string, VehicleRevenue>;
  unallocated: Accrual;
}

export interface AttributedExpenses {
  byVehicle: Map<string, Accrual>;
  unallocated: Accrual;
}

/** `endAt` is the exclusive end of the as-of day; `trailingStartAt` opens the 90-day window. */
export interface EconomicsWindow {
  asOf: string;
  endAt: Date;
  trailingStartAt: Date;
}

function inWindow(at: string, window: EconomicsWindow): { counted: boolean; trailing: boolean } {
  const instant = new Date(at);
  return { counted: instant < window.endAt, trailing: instant >= window.trailingStartAt };
}

function add(target: Accrual, amount: number, trailing: boolean): void {
  target.vnd += amount;
  if (trailing) target.trailingVnd += amount;
}

function vehicleBucket(map: Map<string, VehicleRevenue>, vehicleId: string): VehicleRevenue {
  const existing = map.get(vehicleId);
  if (existing) return existing;
  const created = { rentalDays: 0, trailingVnd: 0, vnd: 0 };
  map.set(vehicleId, created);
  return created;
}

function signedCharge(charge: ContractCharge): number {
  return charge.kind === 'DISCOUNT' ? -charge.amountVnd : charge.amountVnd;
}

/** Only activated, non-cancelled contracts earn; a CONFIRMED booking is still a promise. */
export function earningContracts(contracts: readonly RentalContract[]): RentalContract[] {
  return contracts.filter(
    (contract) => contract.activatedAt !== null && contract.status !== 'CANCELLED',
  );
}

function attributeLines(contract: RentalContract, window: EconomicsWindow, out: AttributedRevenue) {
  for (const line of contract.quote.lines) {
    const { counted, trailing } = inWindow(line.startAt, window);
    if (!counted) continue;
    const bucket = vehicleBucket(out.byVehicle, line.vehicleId);
    add(bucket, line.finalSubtotalVnd, trailing);
    bucket.rentalDays += line.billableDays;
  }
}

function attributeCharges(
  contract: RentalContract,
  window: EconomicsWindow,
  out: AttributedRevenue,
) {
  for (const charge of contract.charges) {
    const { counted, trailing } = inWindow(charge.createdAt, window);
    if (!counted) continue;
    const line = contract.quote.lines.find((item) => item.id === charge.lineId);
    const target = line ? vehicleBucket(out.byVehicle, line.vehicleId) : out.unallocated;
    add(target, signedCharge(charge), trailing);
  }
}

/**
 * Line subtotals and line-level charges belong to the vehicle (replaced lines included: they
 * earned before the swap); delivery fees and contract-level charges stay unallocated.
 */
export function attributeRevenue(
  contracts: readonly RentalContract[],
  window: EconomicsWindow,
): AttributedRevenue {
  const out: AttributedRevenue = { byVehicle: new Map(), unallocated: { trailingVnd: 0, vnd: 0 } };
  for (const contract of earningContracts(contracts)) {
    attributeLines(contract, window, out);
    attributeCharges(contract, window, out);
    const { counted, trailing } = inWindow(contract.activatedAt ?? contract.createdAt, window);
    if (counted) add(out.unallocated, contract.quote.deliveryFeeVnd, trailing);
  }
  return out;
}

/** Expenses count by paid day; reversals subtract; rows without a vehicle stay unallocated. */
export function attributeExpenses(
  expenses: readonly ExpenseRecord[],
  window: EconomicsWindow,
): AttributedExpenses {
  const trailingDay = window.trailingStartAt.toISOString();
  const out: AttributedExpenses = { byVehicle: new Map(), unallocated: { trailingVnd: 0, vnd: 0 } };
  for (const expense of expenses) {
    if (expense.paidOn > window.asOf) continue;
    const trailing = `${expense.paidOn}T23:59:59.999Z` >= trailingDay;
    const bucket = expense.vehicleId
      ? (out.byVehicle.get(expense.vehicleId) ??
        out.byVehicle.set(expense.vehicleId, { trailingVnd: 0, vnd: 0 }).get(expense.vehicleId)!)
      : out.unallocated;
    add(bucket, signedExpenseVnd(expense), trailing);
  }
  return out;
}

const NO_REVENUE: VehicleRevenue = { rentalDays: 0, trailingVnd: 0, vnd: 0 };
const NO_EXPENSES: Accrual = { trailingVnd: 0, vnd: 0 };
const NO_DEPRECIATION = {
  accumulatedDepreciationVnd: 0,
  bookValueVnd: 0,
  monthlyDepreciationVnd: 0,
};

export interface RowInputs {
  acquisition: VehicleAcquisition | null;
  expenses: Accrual | undefined;
  revenue: VehicleRevenue | undefined;
  vehicle: Vehicle;
}

export function economicsRow(inputs: RowInputs, asOf: string): FleetEconomicsRow {
  const revenue = inputs.revenue ?? NO_REVENUE;
  const expenses = inputs.expenses ?? NO_EXPENSES;
  const depreciation = inputs.acquisition
    ? depreciationAt(inputs.acquisition, asOf)
    : NO_DEPRECIATION;
  const purchasePriceVnd = inputs.acquisition?.purchasePriceVnd ?? 0;
  const netVnd = revenue.vnd - expenses.vnd;
  const trailingNetVnd = revenue.trailingVnd - expenses.trailingVnd;
  return {
    accumulatedDepreciationVnd: depreciation.accumulatedDepreciationVnd,
    acquisition: inputs.acquisition,
    bookValueVnd: depreciation.bookValueVnd,
    breakEven: breakEvenProjection({ asOf, netVnd, purchasePriceVnd, trailingNetVnd }),
    code: inputs.vehicle.code,
    expensesVnd: expenses.vnd,
    model: inputs.vehicle.model,
    monthlyDepreciationVnd: depreciation.monthlyDepreciationVnd,
    netVnd,
    plate: inputs.vehicle.plate,
    purchasePriceVnd,
    recoveredPercent: recoveredPercent(purchasePriceVnd, netVnd),
    rentalDays: revenue.rentalDays,
    revenueVnd: revenue.vnd,
    status: inputs.vehicle.status,
    trailingNetVnd,
    typeCode: inputs.vehicle.typeCode,
    vehicleId: inputs.vehicle.id,
  };
}

/** Fleet totals include the unallocated buckets so the bottom line reconciles to the ledgers. */
export function economicsTotals(
  rows: readonly FleetEconomicsRow[],
  unallocated: { expensesVnd: number; revenueVnd: number },
): FleetEconomicsTotals {
  const sum = (pick: (row: FleetEconomicsRow) => number) =>
    rows.reduce((total, row) => total + pick(row), 0);
  const revenueVnd = sum((row) => row.revenueVnd) + unallocated.revenueVnd;
  const expensesVnd = sum((row) => row.expensesVnd) + unallocated.expensesVnd;
  return {
    accumulatedDepreciationVnd: sum((row) => row.accumulatedDepreciationVnd),
    bookValueVnd: sum((row) => row.bookValueVnd),
    expensesVnd,
    netVnd: revenueVnd - expensesVnd,
    purchasePriceVnd: sum((row) => row.purchasePriceVnd),
    rentalDays: sum((row) => row.rentalDays),
    revenueVnd,
    unallocatedExpensesVnd: unallocated.expensesVnd,
    unallocatedRevenueVnd: unallocated.revenueVnd,
    vehicleCount: rows.length,
    vehiclesRecovered: rows.filter((row) => row.breakEven.status === 'RECOVERED').length,
  };
}
