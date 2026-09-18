import {
  cashNoteRequired,
  cashVariance,
  type CashMovements,
  type CashShiftCloseInput,
  type CashShiftExpectation,
  type CashShiftOpenInput,
} from '@rental/contracts';
import { formatCurrency, type Locale } from '@/shared/i18n/locale';

export interface OpenShiftFormValues {
  openingFloatVnd: string;
}

export interface CloseShiftFormValues {
  countedCashVnd: string;
  note: string;
}

export type VarianceTone = 'caution' | 'danger' | 'success';

export interface MovementRow {
  labelKey: string;
  signed: '+' | '-';
  value: string;
}

interface MovementField {
  contributionSign: 1 | -1;
  field: keyof CashMovements;
  labelKey: string;
}

/** Mirrors cashShiftOpenInputSchema / cashShiftCloseInputSchema (0 to 1,000,000,000 VND). */
const MAX_VND = 1_000_000_000;

const MOVEMENT_FIELDS: MovementField[] = [
  { contributionSign: 1, field: 'cashCollectedVnd', labelKey: 'cashShiftCollected' },
  { contributionSign: -1, field: 'cashRefundedVnd', labelKey: 'cashShiftRefunded' },
  { contributionSign: -1, field: 'depositRefundedVnd', labelKey: 'cashShiftDepositRefunded' },
  { contributionSign: -1, field: 'cashExpensesVnd', labelKey: 'cashShiftExpenses' },
];

export const INITIAL_OPEN_FORM: OpenShiftFormValues = { openingFloatVnd: '' };

export const INITIAL_CLOSE_FORM: CloseShiftFormValues = { countedCashVnd: '', note: '' };

function parseVnd(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** Mirrors cashShiftOpenInputSchema so the save button never submits a rejected payload. */
export function openBlocked(form: OpenShiftFormValues): boolean {
  const openingFloatVnd = parseVnd(form.openingFloatVnd);
  return openingFloatVnd === undefined || openingFloatVnd < 0 || openingFloatVnd > MAX_VND;
}

export function toOpenInput(form: OpenShiftFormValues): CashShiftOpenInput {
  return { openingFloatVnd: parseVnd(form.openingFloatVnd) ?? 0 };
}

export function toCloseInput(form: CloseShiftFormValues): CashShiftCloseInput {
  return { countedCashVnd: parseVnd(form.countedCashVnd) ?? 0, note: form.note.trim() };
}

/** Live variance while typing; null until the counted amount is a well-formed number. */
export function previewVariance(
  form: CloseShiftFormValues,
  expectation: CashShiftExpectation,
): number | null {
  const counted = parseVnd(form.countedCashVnd);
  return counted === undefined ? null : cashVariance(counted, expectation.expectedCashVnd);
}

/** Mirrors cashShiftCloseInputSchema plus the BR-04 rule: a note when the drawer is off. */
export function closeBlocked(
  form: CloseShiftFormValues,
  expectation: CashShiftExpectation,
): boolean {
  const counted = parseVnd(form.countedCashVnd);
  if (counted === undefined || counted < 0 || counted > MAX_VND) return true;
  return cashNoteRequired(cashVariance(counted, expectation.expectedCashVnd), form.note);
}

/** The four chips on the current-shift card, in the order the expectedCash formula applies. */
export function movementRows(expectation: CashShiftExpectation, locale: Locale): MovementRow[] {
  return MOVEMENT_FIELDS.map(({ contributionSign, field, labelKey }) => {
    const amount = expectation[field];
    return {
      labelKey,
      signed: contributionSign * amount < 0 ? '-' : '+',
      value: formatCurrency(Math.abs(amount), locale),
    };
  });
}

export function varianceTone(varianceVnd: number): VarianceTone {
  if (varianceVnd === 0) return 'success';
  return varianceVnd < 0 ? 'danger' : 'caution';
}

/** A true minus/plus sign, never a bare hyphen, so the direction reads at a glance. */
export function formatVariance(varianceVnd: number, locale: Locale): string {
  const amount = formatCurrency(Math.abs(varianceVnd), locale);
  if (varianceVnd < 0) return `−${amount}`;
  return varianceVnd > 0 ? `+${amount}` : amount;
}
