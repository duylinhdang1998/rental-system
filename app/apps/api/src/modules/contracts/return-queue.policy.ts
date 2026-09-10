import {
  BUSINESS_TIME_ZONE,
  hoursLate,
  sameBusinessDay,
  type ContractLine,
  type RentalContract,
  type ReturnQueue,
  type ReturnQueueItem,
  type ReturnQueueKind,
  type ReturnQueueLine,
} from '@rental/contracts';
import {
  activeLines,
  isPastScheduledEnd,
  isRentingContract,
  openLines,
} from './contract-lifecycle.policy.js';

const KIND_ORDER: Readonly<Record<ReturnQueueKind, number>> = {
  DUE_TODAY: 1,
  LATER: 2,
  OVERDUE: 0,
};

interface Urgency {
  endAt: string;
  hoursLate: number;
  kind: ReturnQueueKind;
}

/** Overdue first (latest first), then due today and later returns by nearest scheduled end. */
export function compareUrgency(left: Urgency, right: Urgency): number {
  const byKind = KIND_ORDER[left.kind] - KIND_ORDER[right.kind];
  if (byKind !== 0) return byKind;
  if (left.kind === 'OVERDUE') return right.hoursLate - left.hoursLate;
  return Date.parse(left.endAt) - Date.parse(right.endAt);
}

function lineKind(line: ContractLine, now: Date): ReturnQueueKind {
  if (isPastScheduledEnd(line.endAt, now)) return 'OVERDUE';
  return sameBusinessDay(line.endAt, now) ? 'DUE_TODAY' : 'LATER';
}

/** One row per vehicle still with the customer, classified in Asia/Ho_Chi_Minh business time. */
export function queueLine(line: ContractLine, now: Date): ReturnQueueLine {
  const kind = lineKind(line, now);
  return {
    endAt: line.endAt,
    hoursLate: kind === 'OVERDUE' ? hoursLate(line.endAt, now) : 0,
    kind,
    lateReturnPolicy: line.lateReturnPolicy,
    lineId: line.id,
    vehicleCode: line.vehicleCode,
    vehicleId: line.vehicleId,
  };
}

export function queueItem(contract: RentalContract, now: Date): ReturnQueueItem | null {
  if (!isRentingContract(contract.status)) return null;
  const lines = openLines(contract.quote.lines)
    .map((line) => queueLine(line, now))
    .sort(compareUrgency);
  const [first] = lines;
  if (!first) return null;
  const vehicleCount = activeLines(contract.quote.lines).length;
  return {
    code: contract.code,
    contractId: contract.id,
    customerName: contract.quote.customerName,
    depositVnd: contract.handover.depositVnd,
    hoursLate: first.hoursLate,
    kind: first.kind,
    lines,
    nextDueAt: first.endAt,
    returnedCount: vehicleCount - lines.length,
    status: contract.status,
    vehicleCount,
  };
}

function countLines(items: readonly ReturnQueueItem[], kind: ReturnQueueKind): number {
  return items.reduce(
    (sum, item) => sum + item.lines.filter((line) => line.kind === kind).length,
    0,
  );
}

export function buildReturnQueue(contracts: readonly RentalContract[], now: Date): ReturnQueue {
  const items = contracts
    .flatMap((contract) => queueItem(contract, now) ?? [])
    .sort((left, right) =>
      compareUrgency(
        { endAt: left.nextDueAt, hoursLate: left.hoursLate, kind: left.kind },
        { endAt: right.nextDueAt, hoursLate: right.hoursLate, kind: right.kind },
      ),
    );
  return {
    dueToday: countLines(items, 'DUE_TODAY'),
    generatedAt: now.toISOString(),
    items,
    overdue: countLines(items, 'OVERDUE'),
    renting: items.length,
    timeZone: BUSINESS_TIME_ZONE,
  };
}
