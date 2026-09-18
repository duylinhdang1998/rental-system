import {
  MILLISECONDS_PER_DAY,
  type ContractEvent,
  type ContractEventType,
  type ContractLine,
  type ContractStatus,
  type RentalContract,
} from '@rental/contracts';
import { paymentMethodLabel } from '@/features/contracts/lib/payment-presentation';
import { formatCurrency, formatDateTime, type Locale } from '@/shared/i18n/locale';

export type BadgeTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';
export type ContractAction =
  'activate' | 'cancel' | 'charge' | 'extend' | 'payment' | 'refundDeposit' | 'settle' | 'swap';

const STATUS_TONES: Record<ContractStatus, BadgeTone> = {
  ACTIVE: 'info',
  CANCELLED: 'neutral',
  COMPLETED: 'success',
  CONFIRMED: 'warning',
  OVERDUE: 'danger',
};

/**
 * Returning a vehicle is a per-line action (Sprint 5), so it is not listed here. Money can be
 * collected from the reservation onwards (FR-08); a cancelled contract never carries money.
 */
const STATUS_ACTIONS: Record<ContractStatus, ContractAction[]> = {
  ACTIVE: ['payment', 'extend', 'swap', 'charge'],
  CANCELLED: [],
  COMPLETED: ['settle', 'payment', 'charge'],
  CONFIRMED: ['activate', 'payment', 'extend', 'cancel'],
  OVERDUE: ['payment', 'extend', 'swap', 'charge'],
};

const RENTING_STATUSES: ContractStatus[] = ['ACTIVE', 'OVERDUE'];
const SETTLEMENT_STATUSES: ContractStatus[] = ['ACTIVE', 'OVERDUE', 'COMPLETED'];
const PAD_LENGTH = 2;

export function contractStatusTone(status: ContractStatus): BadgeTone {
  return STATUS_TONES[status];
}

/**
 * BR-07: a settled contract is frozen, so only the receivable it froze can still be collected,
 * and the deposit it owes back can be refunded once (US-028).
 */
export function contractActions(
  status: ContractStatus,
  settled = false,
  openReceivable = false,
  depositRefundDue = false,
): ContractAction[] {
  if (!settled) return STATUS_ACTIONS[status];
  return [
    ...(depositRefundDue ? (['refundDeposit'] as const) : []),
    ...(openReceivable ? (['payment'] as const) : []),
  ];
}

/** The refund action shows only while the settled refund figure is still owed to the customer. */
export function depositRefundDue(contract: RentalContract | undefined): boolean {
  const settlement = contract?.settlement ?? null;
  return settlement !== null && settlement.refundVnd > 0 && !settlement.depositRefunded;
}

export function showsLedger(status: ContractStatus): boolean {
  return status !== 'CANCELLED';
}

export function isRentingStatus(status: ContractStatus): boolean {
  return RENTING_STATUSES.includes(status);
}

export function showsSettlement(status: ContractStatus): boolean {
  return SETTLEMENT_STATUSES.includes(status);
}

export function activeContractLines(lines: readonly ContractLine[]): ContractLine[] {
  return lines.filter((line) => line.replacedByLineId === null);
}

/** Active lines whose vehicle is still with the customer. */
export function openContractLines(lines: readonly ContractLine[]): ContractLine[] {
  return activeContractLines(lines).filter((line) => line.inspection === null);
}

/** Converts an ISO instant to the browser-local `datetime-local` input value. */
export function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(PAD_LENGTH, '0');
  const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function localInputToIso(local: string): string {
  return new Date(local).toISOString();
}

export function defaultExtensionEnd(endAt: string): string {
  return toLocalInput(new Date(Date.parse(endAt) + MILLISECONDS_PER_DAY).toISOString());
}

function text(event: ContractEvent, key: string): string {
  const value = event.metadata[key];
  return typeof value === 'string' ? value : '';
}

function stamp(event: ContractEvent, key: string, locale: Locale): string {
  const value = text(event, key);
  return value ? formatDateTime(value, locale) : '';
}

function money(event: ContractEvent, key: string, locale: Locale): string {
  const value = event.metadata[key];
  return typeof value === 'number' ? formatCurrency(value, locale) : '';
}

function signedMoney(event: ContractEvent, locale: Locale): string {
  const amount = money(event, 'amountVnd', locale);
  if (!amount) return '';
  return text(event, 'kind') === 'DISCOUNT' ? `−${amount}` : `+${amount}`;
}

function lateFeeNote(event: ContractEvent, locale: Locale): string {
  const fee = event.metadata.lateFeeVnd;
  return typeof fee === 'number' && fee > 0 ? `+${formatCurrency(fee, locale)}` : '';
}

type EventDescriber = (event: ContractEvent, locale: Locale) => string[];

const describeCharge: EventDescriber = (event, locale) => [
  text(event, 'vehicleCode'),
  signedMoney(event, locale),
];

const describeExtension: EventDescriber = (event, locale) => [
  `${stamp(event, 'previousEndAt', locale)} → ${stamp(event, 'newEndAt', locale)}`,
  `${money(event, 'previousTotalVnd', locale)} → ${money(event, 'newTotalVnd', locale)}`,
];

const describeReturn: EventDescriber = (event, locale) => [
  text(event, 'vehicleCode'),
  stamp(event, 'actualReturnAt', locale),
  lateFeeNote(event, locale),
];

const describeOverdue: EventDescriber = (event, locale) => [stamp(event, 'scheduledEndAt', locale)];

const describeSettlement: EventDescriber = (event, locale) => [money(event, 'totalDueVnd', locale)];

const describeSwap: EventDescriber = (event) => [
  `${text(event, 'fromVehicleCode')} → ${text(event, 'toVehicleCode')}`,
];

/** BR-04: a refund row carries its own minus sign, never a negative payment. */
const describePayment: EventDescriber = (event, locale) => {
  const amount = money(event, 'amountVnd', locale);
  const sign = event.type === 'PAYMENT_RECORDED' ? '+' : '−';
  return [amount ? `${sign}${amount}` : '', paymentMethodLabel(text(event, 'method'), locale)];
};

const DESCRIBERS: Partial<Record<ContractEventType, EventDescriber>> = {
  CHARGE_ADDED: describeCharge,
  DEPOSIT_REFUNDED: describePayment,
  EXTENDED: describeExtension,
  LINE_RETURNED: describeReturn,
  OVERDUE: describeOverdue,
  PAYMENT_RECORDED: describePayment,
  REFUND_RECORDED: describePayment,
  SETTLED: describeSettlement,
  SWAPPED: describeSwap,
};

export function describeEvent(event: ContractEvent, locale: Locale): string {
  const parts = DESCRIBERS[event.type]?.(event, locale) ?? [];
  return [...parts, event.reason ?? ''].filter(Boolean).join(' · ');
}

export interface OverviewRow {
  labelKey: string;
  value: string;
}

export function overviewRows(contract: RentalContract, locale: Locale): OverviewRow[] {
  const { handover, quote } = contract;
  return [
    { labelKey: 'contractCustomer', value: quote.customerName },
    { labelKey: 'contractStart', value: formatDateTime(quote.startAt, locale) },
    { labelKey: 'contractEnd', value: formatDateTime(quote.endAt, locale) },
    { labelKey: 'contractDeposit', value: formatCurrency(handover.depositVnd, locale) },
    { labelKey: 'contractDeliveryFee', value: formatCurrency(quote.deliveryFeeVnd, locale) },
    { labelKey: 'contractDeliveryPlace', value: handover.deliveryPlace },
    { labelKey: 'contractFuel', value: `${handover.fuelPercent}%` },
    { labelKey: 'contractRetainedDocument', value: handover.retainedDocument || '—' },
    { labelKey: 'contractImageCount', value: String(handover.imageCount) },
    { labelKey: 'contractNotes', value: handover.notes || '—' },
  ];
}

export function lifecycleRows(contract: RentalContract, locale: Locale): OverviewRow[] {
  const stamps: [string, string | null][] = [
    ['contractActivatedAt', contract.activatedAt],
    ['contractOverdueSince', contract.overdueSince],
    ['contractCompletedAt', contract.completedAt],
    ['contractSettledAt', contract.settledAt],
    ['contractCancelledAt', contract.cancelledAt],
  ];
  const rows = stamps
    .filter((entry): entry is [string, string] => entry[1] !== null)
    .map(([labelKey, value]) => ({ labelKey, value: formatDateTime(value, locale) }));
  if (contract.cancellationReason) {
    rows.push({ labelKey: 'contractCancelReason', value: contract.cancellationReason });
  }
  return rows;
}
