import type {
  ContractLedger,
  ContractPaymentInput,
  PaymentBalance,
  PaymentKind,
  PaymentMethod,
} from '@rental/contracts';
import { formatCurrency, type Locale } from '@/shared/i18n/locale';

export interface PaymentFormValues {
  amount: string;
  kind: PaymentKind;
  method: PaymentMethod;
  notes: string;
  reference: string;
}

export type PaymentFieldChange = <TField extends keyof PaymentFormValues>(
  field: TField,
  value: PaymentFormValues[TField],
) => void;

export type PaymentCaps = Pick<PaymentBalance, 'paidVnd' | 'remainingVnd'>;

export interface BalanceRow {
  emphasis: boolean;
  labelKey: string;
  value: string;
}

export const PAYMENT_KINDS: PaymentKind[] = ['PAYMENT', 'REFUND'];
export const PAYMENT_METHODS: PaymentMethod[] = ['CASH', 'BANK_TRANSFER'];

export const INITIAL_PAYMENT_FORM: PaymentFormValues = {
  amount: '',
  kind: 'PAYMENT',
  method: 'CASH',
  notes: '',
  reference: '',
};

const METHOD_LABELS: Record<PaymentMethod, Record<Locale, string>> = {
  BANK_TRANSFER: { en: 'Bank transfer', vi: 'Chuyển khoản' },
  CASH: { en: 'Cash', vi: 'Tiền mặt' },
};

export function paymentMethodLabel(method: string, locale: Locale): string {
  const labels = METHOD_LABELS[method as PaymentMethod] as Record<Locale, string> | undefined;
  return labels?.[locale] ?? '';
}

/** BR-04: the direction is always visible; refunds carry a leading minus. */
export function signedAmount(kind: PaymentKind, amountVnd: number, locale: Locale): string {
  return `${kind === 'REFUND' ? '−' : '+'}${formatCurrency(amountVnd, locale)}`;
}

/** Mirrors the API cap: collect up to the receivable, refund up to the net collected. */
export function paymentCapFor(balance: PaymentCaps, kind: PaymentKind): number {
  return kind === 'REFUND' ? balance.paidVnd : balance.remainingVnd;
}

function parseVnd(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function paymentBlocked(form: PaymentFormValues, cap: number): boolean {
  const amount = parseVnd(form.amount);
  return amount === undefined || amount <= 0 || amount > cap;
}

export function toPaymentInput(
  form: PaymentFormValues,
  idempotencyKey: string,
): ContractPaymentInput {
  return {
    amountVnd: parseVnd(form.amount) ?? 0,
    idempotencyKey,
    kind: form.kind,
    method: form.method,
    notes: form.notes.trim(),
    reference: form.reference.trim(),
  };
}

export function balanceRows(balance: PaymentBalance, locale: Locale): BalanceRow[] {
  const money = (value: number) => formatCurrency(value, locale);
  const rows: BalanceRow[] = [
    { emphasis: false, labelKey: 'ledgerTotalDue', value: money(balance.totalDueVnd) },
    { emphasis: false, labelKey: 'ledgerCash', value: money(balance.cashVnd) },
    { emphasis: false, labelKey: 'ledgerTransfer', value: money(balance.transferVnd) },
  ];
  if (balance.refundedVnd > 0) {
    rows.push({
      emphasis: false,
      labelKey: 'ledgerRefunded',
      value: `−${money(balance.refundedVnd)}`,
    });
  }
  rows.push({ emphasis: true, labelKey: 'ledgerPaid', value: money(balance.paidVnd) });
  rows.push({
    emphasis: balance.remainingVnd > 0,
    labelKey: 'ledgerRemaining',
    value: money(balance.remainingVnd),
  });
  return rows;
}

export function ledgerOpenReceivable(ledger: ContractLedger | undefined): boolean {
  return (ledger?.balance.remainingVnd ?? 0) > 0;
}
