import {
  maxDepositApplied,
  settlementFigures,
  type ContractChargeInput,
  type ContractSettleInput,
  type ManualChargeKind,
  type SettlementFigures,
  type SettlementStatement,
} from '@rental/contracts';
import type { BadgeTone } from '@/features/contracts/lib/contract-presentation';
import { formatCurrency, type Locale } from '@/shared/i18n/locale';

export type SettlementOutcome = 'receivable' | 'refund' | 'zero';

export interface FigureRow {
  emphasis: boolean;
  labelKey: string;
  value: string;
}

export interface SettleFormValues {
  depositApplied: string;
  depositRefunded: boolean;
  documentReturned: boolean;
  notes: string;
}

export interface ChargeFormValues {
  amount: string;
  description: string;
  kind: ManualChargeKind;
  lineId: string;
}

export const OUTCOME_LABEL_KEYS: Record<SettlementOutcome, string> = {
  receivable: 'settlementOutcomeReceivable',
  refund: 'settlementOutcomeRefund',
  zero: 'settlementOutcomeZero',
};

export const OUTCOME_TONES: Record<SettlementOutcome, BadgeTone> = {
  receivable: 'danger',
  refund: 'info',
  zero: 'success',
};

export const INITIAL_CHARGE_FORM: ChargeFormValues = {
  amount: '',
  description: '',
  kind: 'OTHER',
  lineId: '',
};

/** BR-04: the direction of money is always explicit; never a signed single number. */
export function settlementOutcome(
  figures: Pick<SettlementFigures, 'receivableVnd' | 'refundVnd'>,
): SettlementOutcome {
  if (figures.receivableVnd > 0) return 'receivable';
  return figures.refundVnd > 0 ? 'refund' : 'zero';
}

export function outcomeAmount(figures: SettlementFigures): number {
  const outcome = settlementOutcome(figures);
  if (outcome === 'receivable') return figures.receivableVnd;
  return outcome === 'refund' ? figures.refundVnd : 0;
}

type Money = (value: number) => string;

function dueRows(figures: SettlementFigures, money: Money): FigureRow[] {
  const rows: FigureRow[] = [
    { emphasis: false, labelKey: 'settlementCharges', value: money(figures.chargesVnd) },
  ];
  if (figures.discountsVnd > 0) {
    rows.push({
      emphasis: false,
      labelKey: 'settlementDiscounts',
      value: `−${money(figures.discountsVnd)}`,
    });
  }
  rows.push({ emphasis: true, labelKey: 'settlementTotalDue', value: money(figures.totalDueVnd) });
  return rows;
}

function balanceRows(figures: SettlementFigures, money: Money): FigureRow[] {
  return [
    { emphasis: false, labelKey: 'settlementPaid', value: money(figures.paidVnd) },
    { emphasis: false, labelKey: 'settlementDeposit', value: money(figures.depositVnd) },
    {
      emphasis: false,
      labelKey: 'settlementDepositApplied',
      value: money(figures.depositAppliedVnd),
    },
    {
      emphasis: figures.receivableVnd > 0,
      labelKey: 'settlementReceivable',
      value: money(figures.receivableVnd),
    },
    {
      emphasis: figures.refundVnd > 0,
      labelKey: 'settlementRefund',
      value: money(figures.refundVnd),
    },
  ];
}

export function figureRows(figures: SettlementFigures, locale: Locale): FigureRow[] {
  const money: Money = (value) => formatCurrency(value, locale);
  return [...dueRows(figures, money), ...balanceRows(figures, money)];
}

function parseVnd(value: string): number | undefined {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function initialSettleForm(statement: SettlementStatement): SettleFormValues {
  return {
    depositApplied: String(statement.depositAppliedVnd),
    depositRefunded: false,
    documentReturned: false,
    notes: '',
  };
}

/** Recomputes the figures locally with the shared formula while staff adjust the deposit. */
export function previewSettlement(
  statement: SettlementStatement,
  depositApplied: string,
): SettlementFigures {
  return settlementFigures({
    chargesVnd: statement.chargesVnd,
    depositAppliedVnd: parseVnd(depositApplied),
    depositVnd: statement.depositVnd,
    discountsVnd: statement.discountsVnd,
    paidVnd: statement.paidVnd,
  });
}

export function depositCap(figures: SettlementFigures): number {
  return maxDepositApplied(figures.depositVnd, figures.outstandingVnd);
}

export function toSettleInput(form: SettleFormValues): ContractSettleInput {
  const requested = parseVnd(form.depositApplied);
  return {
    ...(requested === undefined ? {} : { depositAppliedVnd: requested }),
    depositRefunded: form.depositRefunded,
    documentReturned: form.documentReturned,
    notes: form.notes.trim(),
  };
}

/** Mirrors the API checklist so the button only enables once the physical hand-backs are confirmed. */
export function settleBlocked(
  form: SettleFormValues,
  preview: SettlementFigures,
  retainedDocument: string,
): boolean {
  if (retainedDocument !== '' && !form.documentReturned) return true;
  return preview.refundVnd > 0 && !form.depositRefunded;
}

/** BR-06: only the Owner may record a discount. */
export function chargeKinds(isOwner: boolean): ManualChargeKind[] {
  return isOwner ? ['DAMAGE', 'OTHER', 'DISCOUNT'] : ['DAMAGE', 'OTHER'];
}

export function toChargeInput(form: ChargeFormValues): ContractChargeInput {
  return {
    amountVnd: parseVnd(form.amount) ?? 0,
    description: form.description.trim(),
    kind: form.kind,
    ...(form.lineId ? { lineId: form.lineId } : {}),
  };
}
