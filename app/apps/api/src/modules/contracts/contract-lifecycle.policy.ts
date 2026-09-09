import type { ContractLine, ContractStatus } from '@rental/contracts';

export type LifecycleTransition = 'ACTIVATE' | 'CANCEL' | 'COMPLETE' | 'OVERDUE';

const TRANSITION_TARGET: Readonly<Record<LifecycleTransition, ContractStatus>> = {
  ACTIVATE: 'ACTIVE',
  CANCEL: 'CANCELLED',
  COMPLETE: 'COMPLETED',
  OVERDUE: 'OVERDUE',
};

const ALLOWED_TRANSITIONS: Readonly<Record<ContractStatus, readonly LifecycleTransition[]>> = {
  ACTIVE: ['OVERDUE', 'COMPLETE'],
  CANCELLED: [],
  COMPLETED: [],
  CONFIRMED: ['ACTIVATE', 'CANCEL'],
  OVERDUE: ['COMPLETE'],
};

/** Statuses whose lines still block vehicle availability. */
export const OPEN_CONTRACT_STATUSES: readonly ContractStatus[] = ['CONFIRMED', 'ACTIVE', 'OVERDUE'];
/** Statuses in which vehicles are physically with the customer. */
export const RENTING_CONTRACT_STATUSES: readonly ContractStatus[] = ['ACTIVE', 'OVERDUE'];

export function canTransitionContract(from: ContractStatus, transition: LifecycleTransition) {
  return ALLOWED_TRANSITIONS[from].includes(transition);
}

export function transitionTarget(transition: LifecycleTransition): ContractStatus {
  return TRANSITION_TARGET[transition];
}

export function isOpenContract(status: ContractStatus): boolean {
  return OPEN_CONTRACT_STATUSES.includes(status);
}

export function isRentingContract(status: ContractStatus): boolean {
  return RENTING_CONTRACT_STATUSES.includes(status);
}

/** A rental is overdue from the scheduled end instant; grace only affects fees. */
export function isPastScheduledEnd(endAt: string, now: Date): boolean {
  return Date.parse(endAt) <= now.getTime();
}

export function statusAfterEndChange(
  status: ContractStatus,
  newEndAt: string,
  now: Date,
): ContractStatus {
  if (!isRentingContract(status)) return status;
  return isPastScheduledEnd(newEndAt, now) ? 'OVERDUE' : 'ACTIVE';
}

/** Lines that currently represent a vehicle on the contract (swap chains resolved). */
export function activeLines(lines: readonly ContractLine[]): ContractLine[] {
  return lines.filter((line) => line.replacedByLineId === null);
}

/** Start of the original rental period for a line, following the swap chain backwards. */
export function chainStartAt(line: ContractLine, lines: readonly ContractLine[]): string {
  let current = line;
  const visited = new Set<string>();
  while (current.replacesLineId && !visited.has(current.id)) {
    visited.add(current.id);
    const previous = lines.find((item) => item.id === current.replacesLineId);
    if (!previous) break;
    current = previous;
  }
  return current.startAt;
}

export function quoteBounds(lines: readonly ContractLine[]): { endAt: string; startAt: string } {
  const starts = lines.map((line) => Date.parse(line.startAt));
  const ends = activeLines(lines).map((line) => Date.parse(line.endAt));
  return {
    endAt: new Date(Math.max(...ends)).toISOString(),
    startAt: new Date(Math.min(...starts)).toISOString(),
  };
}

export type VehicleHold = 'AVAILABLE' | 'RESERVED' | 'RENTED';

/** Derives the operational vehicle status from the statuses of contracts still holding it. */
export function holdFromStatuses(statuses: readonly ContractStatus[]): VehicleHold {
  if (statuses.some(isRentingContract)) return 'RENTED';
  if (statuses.includes('CONFIRMED')) return 'RESERVED';
  return 'AVAILABLE';
}
