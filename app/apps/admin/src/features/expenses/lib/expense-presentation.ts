import {
  businessDayKey,
  type Expense,
  type ExpenseCategory,
  type ExpenseInput,
  type ExpenseListQuery,
  type PaymentMethod,
  type UserRole,
  type Vehicle,
} from '@rental/contracts';
import { formatCurrency, formatDate, type Locale } from '@/shared/i18n/locale';

export interface ExpenseFormValues {
  amount: string;
  category: ExpenseCategory;
  description: string;
  method: PaymentMethod;
  notes: string;
  paidOn: string;
  reference: string;
  vehicleId: string;
}

export type ExpenseFieldChange = <TField extends keyof ExpenseFormValues>(
  field: TField,
  value: ExpenseFormValues[TField],
) => void;

export interface ExpenseFilters {
  category: string;
  from: string;
  to: string;
  vehicleId: string;
}

export type ExpenseStatus = 'ORIGINAL' | 'REVERSAL' | 'REVERSED';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
/** Asia/Ho_Chi_Minh has no daylight saving, so a fixed offset is exact. */
const BUSINESS_OFFSET = '+07:00';
const MIN_DESCRIPTION = 3;
const MAX_AMOUNT = 1_000_000_000;

export const EMPTY_EXPENSE_FILTERS: ExpenseFilters = {
  category: '',
  from: '',
  to: '',
  vehicleId: '',
};

/** The paid day defaults to the business day the dialog opens on; everything else is typed. */
export function initialExpenseForm(now: Date): ExpenseFormValues {
  return {
    amount: '',
    category: 'MAINTENANCE',
    description: '',
    method: 'CASH',
    notes: '',
    paidOn: businessDayKey(now),
    reference: '',
    vehicleId: '',
  };
}

function parseVnd(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** Mirrors expenseInputSchema so the save button never submits a payload the API rejects. */
export function expenseBlocked(form: ExpenseFormValues): boolean {
  const amount = parseVnd(form.amount);
  if (amount === undefined || amount <= 0 || amount > MAX_AMOUNT) return true;
  if (form.description.trim().length < MIN_DESCRIPTION) return true;
  return !DATE_PATTERN.test(form.paidOn);
}

export function toExpenseInput(form: ExpenseFormValues, idempotencyKey: string): ExpenseInput {
  return {
    amountVnd: parseVnd(form.amount) ?? 0,
    category: form.category,
    description: form.description.trim(),
    idempotencyKey,
    method: form.method,
    notes: form.notes.trim(),
    paidOn: form.paidOn,
    reference: form.reference.trim(),
    vehicleId: form.vehicleId || null,
  };
}

/** Only well-formed filters reach the API; a half-typed date does not fire a query. */
export function expenseQueryFrom(filters: ExpenseFilters): ExpenseListQuery {
  return {
    ...(filters.category ? { category: filters.category as ExpenseCategory } : {}),
    ...(DATE_PATTERN.test(filters.from) ? { from: filters.from } : {}),
    limit: 200,
    ...(DATE_PATTERN.test(filters.to) ? { to: filters.to } : {}),
    ...(filters.vehicleId ? { vehicleId: filters.vehicleId } : {}),
  };
}

export function expenseStatus(expense: Expense): ExpenseStatus {
  if (expense.reversalOfId) return 'REVERSAL';
  return expense.reversedByExpenseId ? 'REVERSED' : 'ORIGINAL';
}

/** BR-09: a reversal is shown with a leading minus so the direction is never ambiguous. */
export function signedExpenseAmount(expense: Expense, locale: Locale): string {
  const amount = formatCurrency(expense.amountVnd, locale);
  return expense.reversalOfId ? `−${amount}` : amount;
}

/** Only the Owner reverses, and only an original that has not been reversed yet. */
export function expenseReversible(expense: Expense, role: UserRole | undefined): boolean {
  return role === 'OWNER' && expenseStatus(expense) === 'ORIGINAL';
}

/** A paid day is a calendar day in the business time zone, never shifted by the browser. */
export function formatPaidOn(paidOn: string, locale: Locale): string {
  return formatDate(new Date(`${paidOn}T00:00:00${BUSINESS_OFFSET}`), locale);
}

export function expenseCategoryKey(category: string): string {
  return `expenseCategory.${category}`;
}

/** Select options over the fleet, with the caller's label for "no vehicle" first. */
export function vehicleOptions(
  vehicles: readonly Vehicle[],
  emptyLabel: string,
): { label: string; value: string }[] {
  return [
    { label: emptyLabel, value: '' },
    ...vehicles.map((vehicle) => ({
      label: `${vehicle.code} · ${vehicle.plate}`,
      value: vehicle.id,
    })),
  ];
}
