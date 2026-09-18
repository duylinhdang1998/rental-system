import {
  businessDayKey,
  type ContractPayment,
  type DailyRevenueRow,
  type EmployeeRevenueRow,
  type RentalContract,
  type ReportContractRow,
  type RevenueTotals,
} from '@rental/contracts';
import { activeLines } from '../contracts/contract-lifecycle.policy.js';

export interface PaymentRow {
  contract: RentalContract;
  day: string;
  payment: ContractPayment;
}

export interface RowContext {
  contacts: ReadonlyMap<string, string>;
  names: ReadonlyMap<string, string>;
}

interface Window {
  endAt: Date;
  startAt: Date;
}

type MethodTotals = Pick<
  RevenueTotals,
  'cashVnd' | 'netVnd' | 'paymentCount' | 'refundVnd' | 'transferVnd'
>;

function within(window: Window, at: string): boolean {
  const time = Date.parse(at);
  return time >= window.startAt.getTime() && time < window.endAt.getTime();
}

/**
 * Every revenue row received inside the window, tagged with its Asia/Ho_Chi_Minh business day.
 * Deposit refunds hand back the customer's own money and never appear in revenue (BR-11).
 */
export function paymentsInWindow(
  contracts: readonly RentalContract[],
  window: Window,
): PaymentRow[] {
  return contracts
    .flatMap((contract) =>
      contract.payments
        .filter(
          (payment) => payment.kind !== 'DEPOSIT_REFUND' && within(window, payment.receivedAt),
        )
        .map((payment) => ({ contract, day: businessDayKey(payment.receivedAt), payment })),
    )
    .sort(
      (left, right) => Date.parse(left.payment.receivedAt) - Date.parse(right.payment.receivedAt),
    );
}

function methodTotals(rows: readonly PaymentRow[]): MethodTotals {
  const totals = { cashVnd: 0, netVnd: 0, paymentCount: rows.length, refundVnd: 0, transferVnd: 0 };
  for (const { payment } of rows) {
    if (payment.kind === 'REFUND') {
      totals.refundVnd += payment.amountVnd;
    } else if (payment.method === 'CASH') {
      totals.cashVnd += payment.amountVnd;
    } else {
      totals.transferVnd += payment.amountVnd;
    }
  }
  totals.netVnd = Math.max(0, totals.cashVnd + totals.transferVnd - totals.refundVnd);
  return totals;
}

export function revenueTotals(rows: readonly PaymentRow[]): RevenueTotals {
  return {
    ...methodTotals(rows),
    contractCount: new Set(rows.map((row) => row.contract.id)).size,
  };
}

function groupBy<TKey extends string>(
  rows: readonly PaymentRow[],
  key: (row: PaymentRow) => TKey,
): Map<TKey, PaymentRow[]> {
  const groups = new Map<TKey, PaymentRow[]>();
  for (const row of rows) {
    const group = groups.get(key(row)) ?? [];
    group.push(row);
    groups.set(key(row), group);
  }
  return groups;
}

export function dailyRows(rows: readonly PaymentRow[]): DailyRevenueRow[] {
  return [...groupBy(rows, (row) => row.day)]
    .map(([day, group]) => ({ day, ...methodTotals(group) }))
    .sort((left, right) => left.day.localeCompare(right.day));
}

export function employeeRows(
  rows: readonly PaymentRow[],
  names: ReadonlyMap<string, string>,
): EmployeeRevenueRow[] {
  return [...groupBy(rows, (row) => row.payment.receivedById)]
    .map(([employeeId, group]) => ({
      employeeId,
      employeeName: names.get(employeeId) ?? employeeId,
      ...methodTotals(group),
    }))
    .sort(
      (left, right) =>
        right.netVnd - left.netVnd || left.employeeName.localeCompare(right.employeeName),
    );
}

function signedByMethod(rows: readonly PaymentRow[], method: ContractPayment['method']): number {
  return rows
    .filter((row) => row.payment.method === method)
    .reduce(
      (sum, row) =>
        sum + (row.payment.kind === 'REFUND' ? -row.payment.amountVnd : row.payment.amountVnd),
      0,
    );
}

function returnAt(contract: RentalContract): string | null {
  const returned = activeLines(contract.quote.lines)
    .map((line) => line.inspection?.actualReturnAt ?? null)
    .filter((value): value is string => value !== null)
    .sort();
  return returned.at(-1) ?? contract.completedAt;
}

function depositOrDocument(contract: RentalContract): string {
  const { depositVnd, retainedDocument } = contract.handover;
  const parts = [
    depositVnd > 0 ? `Cọc ${depositVnd.toLocaleString('vi-VN')} ₫` : '',
    retainedDocument,
  ];
  return parts.filter(Boolean).join(' · ');
}

function groupNotes(group: readonly PaymentRow[]): string {
  return group
    .map((row) => row.payment.notes)
    .filter(Boolean)
    .join(' · ');
}

function groupEmployees(group: readonly PaymentRow[], names: ReadonlyMap<string, string>): string {
  const ids = [...new Set(group.map((row) => row.payment.receivedById))];
  return ids.map((id) => names.get(id) ?? id).join(', ');
}

function contractRow(
  sequence: number,
  group: readonly PaymentRow[],
  context: RowContext,
): ReportContractRow {
  const [first] = group;
  const { contract } = first!;
  const lines = activeLines(contract.quote.lines);
  return {
    address: contract.handover.deliveryPlace,
    cashVnd: signedByMethod(group, 'CASH'),
    code: contract.code,
    contact: context.contacts.get(contract.customerId) ?? '',
    contractId: contract.id,
    customerName: contract.quote.customerName,
    depositOrDocument: depositOrDocument(contract),
    employeeName: groupEmployees(group, context.names),
    notes: groupNotes(group),
    rentalDays: Math.max(0, ...lines.map((line) => line.billableDays)),
    returnAt: returnAt(contract),
    sequence,
    time: first!.payment.receivedAt,
    transferVnd: signedByMethod(group, 'BANK_TRANSFER'),
    unitPriceVnd: lines.reduce((sum, line) => sum + line.dailyRateVnd, 0),
    vehicleCodes: lines.map((line) => line.vehicleCode),
  };
}

/** One line per contract with money movement in the window, in first-payment order (client layout). */
export function contractRows(
  rows: readonly PaymentRow[],
  context: RowContext,
): ReportContractRow[] {
  return [...groupBy(rows, (row) => row.contract.id).values()].map((group, index) =>
    contractRow(index + 1, group, context),
  );
}
