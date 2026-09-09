import {
  BUSINESS_TIME_ZONE,
  hoursLate,
  sameBusinessDay,
  type BoardItem,
  type BoardItemKind,
  type FleetSummary,
  type OperationsBoard,
  type RentalContract,
  type Vehicle,
} from '@rental/contracts';
import { activeLines, isPastScheduledEnd, isRentingContract } from './contract-lifecycle.policy.js';

const KIND_ORDER: Readonly<Record<BoardItemKind, number>> = {
  DUE_TODAY: 1,
  OVERDUE: 0,
  PICKUP_TODAY: 2,
};

function classify(contract: RentalContract, now: Date): BoardItemKind | null {
  if (isRentingContract(contract.status)) {
    if (isPastScheduledEnd(contract.quote.endAt, now)) return 'OVERDUE';
    return sameBusinessDay(contract.quote.endAt, now) ? 'DUE_TODAY' : null;
  }
  if (contract.status === 'CONFIRMED' && sameBusinessDay(contract.quote.startAt, now)) {
    return 'PICKUP_TODAY';
  }
  return null;
}

/** Board rows for one contract: overdue (with hours late), due today or pick-up today. */
export function boardItem(contract: RentalContract, now: Date): BoardItem | null {
  const kind = classify(contract, now);
  if (!kind) return null;
  const dueAt = kind === 'PICKUP_TODAY' ? contract.quote.startAt : contract.quote.endAt;
  return {
    code: contract.code,
    contractId: contract.id,
    customerName: contract.quote.customerName,
    dueAt,
    hoursLate: kind === 'OVERDUE' ? hoursLate(dueAt, now) : 0,
    kind,
    status: contract.status,
    totalVnd: contract.quote.totalVnd,
    vehicleCodes: activeLines(contract.quote.lines).map((line) => line.vehicleCode),
  };
}

/** Overdue first (latest first), then due today and pick-ups by nearest time. */
export function sortBoardItems(items: BoardItem[]): BoardItem[] {
  return [...items].sort((left, right) => {
    const byKind = KIND_ORDER[left.kind] - KIND_ORDER[right.kind];
    if (byKind !== 0) return byKind;
    if (left.kind === 'OVERDUE') return right.hoursLate - left.hoursLate;
    return Date.parse(left.dueAt) - Date.parse(right.dueAt);
  });
}

export function fleetSummary(vehicles: readonly Vehicle[]): FleetSummary {
  const available = vehicles.filter((vehicle) => vehicle.status === 'AVAILABLE').length;
  const rented = vehicles.filter((vehicle) => vehicle.status === 'RENTED').length;
  return { available, other: vehicles.length - available - rented, rented, total: vehicles.length };
}

export function buildBoard(
  contracts: readonly RentalContract[],
  vehicles: readonly Vehicle[],
  now: Date,
): OperationsBoard {
  const items = sortBoardItems(contracts.flatMap((contract) => boardItem(contract, now) ?? []));
  const overdue = items.filter((item) => item.kind === 'OVERDUE');
  const dueToday = items.filter((item) => item.kind === 'DUE_TODAY');
  const fleet = fleetSummary(vehicles);
  return {
    activeRentals: contracts.filter((contract) => isRentingContract(contract.status)).length,
    availableVehicles: fleet.available,
    dueToday: dueToday.length,
    fleet,
    generatedAt: now.toISOString(),
    items,
    maxOverdueHours: overdue.reduce((max, item) => Math.max(max, item.hoursLate), 0),
    nearestDueAt: dueToday[0]?.dueAt ?? null,
    overdue: overdue.length,
    timeZone: BUSINESS_TIME_ZONE,
  };
}
