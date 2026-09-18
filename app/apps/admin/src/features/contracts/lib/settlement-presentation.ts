import {
  maxDepositApplied,
  settlementFigures,
  type ContractChargeInput,
  type ContractSettleInput,
  type DamageItem,
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

/** PD-17: the deposit refund left the checklist; it is its own ledger action after settlement. */
export interface SettleFormValues {
  depositApplied: string;
  documentReturned: boolean;
  notes: string;
}

export interface ChargeFormValues {
  amount: string;
  damageItemId: string;
  description: string;
  kind: ManualChargeKind;
  lineId: string;
}

export type ChargeFieldChange = <TField extends keyof ChargeFormValues>(
  field: TField,
  value: ChargeFormValues[TField],
) => void;

/** Picking a catalog item copies its price and name into the form; "free text" clears them. */
export function applyChargeItem(change: ChargeFieldChange, item: DamageItem | null): void {
  change('damageItemId', item?.id ?? '');
  change('amount', item ? String(item.priceVnd) : '');
  change('description', item?.name ?? '');
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
  damageItemId: '',
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
    documentReturned: form.documentReturned,
    notes: form.notes.trim(),
  };
}

/** Mirrors the API checklist: a retained document must be handed back before settling. */
export function settleBlocked(form: SettleFormValues, retainedDocument: string): boolean {
  return retainedDocument !== '' && !form.documentReturned;
}

/** BR-06: only the Owner may record a discount. */
export function chargeKinds(isOwner: boolean): ManualChargeKind[] {
  return isOwner ? ['DAMAGE', 'OTHER', 'DISCOUNT'] : ['DAMAGE', 'OTHER'];
}

/** A catalog item only prices a DAMAGE charge; other kinds keep the free-text fields. */
export function catalogLocked(kind: string, damageItemId: string): boolean {
  return kind === 'DAMAGE' && damageItemId !== '';
}

export function toChargeInput(form: ChargeFormValues): ContractChargeInput {
  const line = form.lineId ? { lineId: form.lineId } : {};
  if (catalogLocked(form.kind, form.damageItemId)) {
    return { damageItemId: form.damageItemId, kind: form.kind, ...line };
  }
  return {
    amountVnd: parseVnd(form.amount) ?? 0,
    description: form.description.trim(),
    kind: form.kind,
    ...line,
  };
}
