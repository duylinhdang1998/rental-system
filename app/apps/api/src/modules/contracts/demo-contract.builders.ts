import { randomUUID } from 'node:crypto';
import type { ContractCharge, ContractEvent, RentalContract } from '@rental/contracts';
import type { ReservationEntry } from '../../common/reservations/reservation-registry.js';
import { isOpenContract, isRentingContract } from './contract-lifecycle.policy.js';
import type {
  ChargeDraft,
  ContractDraft,
  LifecycleEventInput,
  SettlementDraft,
} from './contract.types.js';

export function buildEvent(event: LifecycleEventInput): ContractEvent {
  return {
    actorId: event.actorId,
    id: randomUUID(),
    metadata: event.metadata ?? {},
    occurredAt: event.occurredAt,
    reason: event.reason ?? null,
    type: event.type,
  };
}

export function buildLines(draft: ContractDraft): RentalContract['quote']['lines'] {
  return draft.quote.lines.map((line) => ({
    ...structuredClone(line),
    endAt: draft.quote.endAt,
    id: randomUUID(),
    inspection: null,
    replacedByLineId: null,
    replacesLineId: null,
    startAt: draft.quote.startAt,
  }));
}

export function buildHandover(draft: ContractDraft): RentalContract['handover'] {
  return {
    deliveryPlace: draft.handover.deliveryPlace,
    depositVnd: draft.handover.depositVnd,
    fuelPercent: draft.handover.fuelPercent,
    imageCount: draft.handover.imageObjectKeys.length,
    notes: draft.handover.notes,
    retainedDocument: draft.handover.retainedDocument,
  };
}

export function buildContract(draft: ContractDraft): RentalContract {
  const createdAt = new Date().toISOString();
  return {
    activatedAt: null,
    cancellationReason: null,
    cancelledAt: null,
    cancelledById: null,
    charges: [],
    code: draft.code,
    completedAt: null,
    createdAt,
    customerId: draft.customerId,
    events: [buildEvent({ actorId: draft.actorId, occurredAt: createdAt, type: 'CREATED' })],
    handover: buildHandover(draft),
    id: randomUUID(),
    overdueSince: null,
    quote: { ...structuredClone(draft.quote), lines: buildLines(draft) },
    settledAt: null,
    settlement: null,
    status: 'CONFIRMED',
  };
}

export function buildCharge(
  draft: ChargeDraft,
  actorId: string,
  createdAt: string,
): ContractCharge {
  return {
    actorId,
    amountVnd: draft.amountVnd,
    createdAt,
    description: draft.description,
    id: randomUUID(),
    kind: draft.kind,
    lineId: draft.lineId,
    vehicleCode: draft.vehicleCode,
  };
}

export function buildSettlement(draft: SettlementDraft): NonNullable<RentalContract['settlement']> {
  return { ...draft, id: randomUUID() };
}

/** Returned lines stop blocking the vehicle; replaced lines keep their truncated interval. */
export function reservationEntries(contract: RentalContract): ReservationEntry[] {
  if (!isOpenContract(contract.status)) return [];
  const state = isRentingContract(contract.status) ? 'RENTED' : 'HELD';
  return contract.quote.lines
    .filter((line) => line.inspection === null)
    .map((line) => ({
      endAt: line.endAt,
      startAt: line.startAt,
      state,
      vehicleId: line.vehicleId,
    }));
}
