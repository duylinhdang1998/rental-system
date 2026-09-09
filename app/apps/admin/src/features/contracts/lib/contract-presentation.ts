import {
  MILLISECONDS_PER_DAY,
  type ContractEvent,
  type ContractLine,
  type ContractStatus,
  type RentalContract,
} from '@rental/contracts';
import { formatCurrency, formatDateTime, type Locale } from '@/shared/i18n/locale';

export type BadgeTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';
export type ContractAction = 'activate' | 'cancel' | 'complete' | 'extend' | 'swap';

const STATUS_TONES: Record<ContractStatus, BadgeTone> = {
  ACTIVE: 'info',
  CANCELLED: 'neutral',
  COMPLETED: 'success',
  CONFIRMED: 'warning',
  OVERDUE: 'danger',
};

const STATUS_ACTIONS: Record<ContractStatus, ContractAction[]> = {
  ACTIVE: ['complete', 'extend', 'swap'],
  CANCELLED: [],
  COMPLETED: [],
  CONFIRMED: ['activate', 'extend', 'cancel'],
  OVERDUE: ['complete', 'extend', 'swap'],
};

const PAD_LENGTH = 2;

export function contractStatusTone(status: ContractStatus): BadgeTone {
  return STATUS_TONES[status];
}

export function contractActions(status: ContractStatus): ContractAction[] {
  return STATUS_ACTIONS[status];
}

export function activeContractLines(lines: readonly ContractLine[]): ContractLine[] {
  return lines.filter((line) => line.replacedByLineId === null);
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

function money(event: ContractEvent, key: string, locale: Locale): string {
  const value = event.metadata[key];
  return typeof value === 'number' ? formatCurrency(value, locale) : '';
}

export function describeEvent(event: ContractEvent, locale: Locale): string {
  if (event.type === 'EXTENDED') {
    const period = `${formatDateTime(text(event, 'previousEndAt'), locale)} → ${formatDateTime(text(event, 'newEndAt'), locale)}`;
    const totals = `${money(event, 'previousTotalVnd', locale)} → ${money(event, 'newTotalVnd', locale)}`;
    return [period, totals, event.reason ?? ''].filter(Boolean).join(' · ');
  }
  if (event.type === 'SWAPPED') {
    const vehicles = `${text(event, 'fromVehicleCode')} → ${text(event, 'toVehicleCode')}`;
    return [vehicles, event.reason ?? ''].filter(Boolean).join(' · ');
  }
  if (event.type === 'OVERDUE') return formatDateTime(text(event, 'scheduledEndAt'), locale);
  return event.reason ?? '';
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
