import type { Prisma } from '@prisma/client';
import { CONTRACT_INCLUDE, eventData } from './prisma-contract.mapper.js';
import type {
  ChargeDraft,
  LifecycleEventInput,
  ReturnChange,
  SettlementDraft,
} from './contract.types.js';

const SYSTEM_ACTOR_ID = 'system';

function chargeData(draft: ChargeDraft, actorId: string) {
  return {
    actorId,
    amountVnd: draft.amountVnd,
    description: draft.description,
    kind: draft.kind,
    lineId: draft.lineId,
    metadata: draft.metadata ?? {},
    vehicleCode: draft.vehicleCode,
  };
}

function lineReturnData(inspection: ReturnChange['inspection']) {
  return {
    blocksAvailability: false,
    returnCondition: inspection.condition,
    returnFuelPercent: inspection.fuelPercent,
    returnImageObjectKeys: inspection.imageObjectKeys,
    returnNotes: inspection.notes,
    returnedAt: new Date(inspection.actualReturnAt),
    returnedById: inspection.returnedById,
  };
}

/** Line inspection, auto/inspection charges, optional completion and events in one transaction. */
export async function writeReturn(
  transaction: Prisma.TransactionClient,
  id: string,
  change: ReturnChange,
  events: LifecycleEventInput[],
) {
  const actorId = events[0]?.actorId ?? SYSTEM_ACTOR_ID;
  await transaction.contractVehicleLine.update({
    data: lineReturnData(change.inspection),
    where: { id: change.lineId },
  });
  if (change.charges.length) {
    await transaction.contractCharge.createMany({
      data: change.charges.map((draft) => ({ ...chargeData(draft, actorId), contractId: id })),
    });
  }
  return transaction.contract.update({
    data: {
      ...(change.completedAt
        ? { completedAt: new Date(change.completedAt), status: 'COMPLETED' as const }
        : {}),
      events: { create: events.map(eventData) },
    },
    include: CONTRACT_INCLUDE,
    where: { id },
  });
}

export function writeCharge(
  transaction: Prisma.TransactionClient,
  id: string,
  draft: ChargeDraft,
  event: LifecycleEventInput,
) {
  return transaction.contract.update({
    data: {
      charges: { create: chargeData(draft, event.actorId) },
      events: { create: eventData(event) },
    },
    include: CONTRACT_INCLUDE,
    where: { id },
  });
}

export function writeSettlement(
  transaction: Prisma.TransactionClient,
  id: string,
  draft: SettlementDraft,
  event: LifecycleEventInput,
) {
  const settledAt = new Date(draft.settledAt);
  return transaction.contract.update({
    data: {
      events: { create: eventData(event) },
      settledAt,
      settlement: { create: { ...draft, settledAt } },
    },
    include: CONTRACT_INCLUDE,
    where: { id },
  });
}
