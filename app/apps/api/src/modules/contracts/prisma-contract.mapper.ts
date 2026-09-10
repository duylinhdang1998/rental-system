import type { Prisma } from '@prisma/client';
import {
  chargeKindSchema,
  contractEventMetadataSchema,
  contractEventTypeSchema,
  contractStatusSchema,
  returnConditionSchema,
  type ContractCharge,
  type ContractEvent,
  type ContractLine,
  type QuoteLine,
  type RentalContract,
} from '@rental/contracts';
import { quoteBounds } from './contract-lifecycle.policy.js';
import type { LifecycleEventInput } from './contract.types.js';

export const CONTRACT_INCLUDE = {
  charges: { orderBy: { createdAt: 'asc' } },
  events: { orderBy: { occurredAt: 'asc' } },
  handover: true,
  lines: {
    include: { pricingVersion: true, replacedBy: { select: { id: true } }, vehicle: true },
    orderBy: { createdAt: 'asc' },
  },
  settlement: true,
} as const;

export type ContractRecord = Prisma.ContractGetPayload<{ include: typeof CONTRACT_INCLUDE }>;
type LineRecord = ContractRecord['lines'][number];
type ChargeRecord = ContractRecord['charges'][number];

export function eventData(event: LifecycleEventInput) {
  return {
    actorId: event.actorId,
    metadata: event.metadata ?? {},
    occurredAt: new Date(event.occurredAt),
    reason: event.reason ?? null,
    type: event.type,
  };
}

function mapInspection(
  line: LineRecord,
  charges: readonly ChargeRecord[],
): ContractLine['inspection'] {
  if (!line.returnedAt || !line.returnCondition) return null;
  const lateFee = charges.find(
    (charge) => charge.lineId === line.id && charge.kind === 'LATE_RETURN',
  );
  return {
    actualReturnAt: line.returnedAt.toISOString(),
    condition: returnConditionSchema.parse(line.returnCondition),
    fuelPercent: line.returnFuelPercent ?? 0,
    imageCount: line.returnImageObjectKeys.length,
    lateFeeVnd: lateFee?.amountVnd ?? 0,
    notes: line.returnNotes ?? '',
    returnedById: line.returnedById ?? 'system',
  };
}

export function mapLine(line: LineRecord, charges: readonly ChargeRecord[] = []): ContractLine {
  return {
    adjustmentPercent: line.adjustmentPercent,
    baseSubtotalVnd: line.baseSubtotalVnd,
    billableDays: line.billableDays,
    dailyRateVnd: line.dailyRateVnd,
    endAt: line.endAt.toISOString(),
    explanation: line.explanation,
    finalSubtotalVnd: line.finalSubtotalVnd,
    id: line.id,
    inspection: mapInspection(line, charges),
    lateReturnPolicy: {
      graceMinutes: line.lateReturnGraceMinutes,
      hourlyRateVnd: line.lateReturnHourlyRateVnd,
    },
    ...(line.overrideReason ? { overrideReason: line.overrideReason } : {}),
    pricingVersionId: line.pricingVersionId,
    pricingVersionNumber: line.pricingVersion.version,
    replacedByLineId: line.replacedBy?.id ?? null,
    replacesLineId: line.replacesLineId,
    startAt: line.startAt.toISOString(),
    vehicleCode: line.vehicle.code,
    vehicleId: line.vehicleId,
  };
}

export function mapHandover(item: ContractRecord['handover']): RentalContract['handover'] {
  if (!item) {
    return {
      deliveryPlace: '',
      depositVnd: 0,
      fuelPercent: 0,
      imageCount: 0,
      notes: '',
      retainedDocument: '',
    };
  }
  return {
    deliveryPlace: item.deliveryPlace,
    depositVnd: item.depositVnd,
    fuelPercent: item.fuelPercent,
    imageCount: item.imageObjectKeys.length,
    notes: item.notes,
    retainedDocument: item.retainedDocument,
  };
}

export function mapEvent(item: ContractRecord['events'][number]): ContractEvent {
  const metadata = contractEventMetadataSchema.safeParse(item.metadata);
  return {
    actorId: item.actorId,
    id: item.id,
    metadata: metadata.success ? metadata.data : {},
    occurredAt: item.occurredAt.toISOString(),
    reason: item.reason,
    type: contractEventTypeSchema.parse(item.type),
  };
}

export function mapCharge(item: ChargeRecord): ContractCharge {
  return {
    actorId: item.actorId,
    amountVnd: item.amountVnd,
    createdAt: item.createdAt.toISOString(),
    description: item.description,
    id: item.id,
    kind: chargeKindSchema.parse(item.kind),
    lineId: item.lineId,
    vehicleCode: item.vehicleCode,
  };
}

export function mapSettlement(item: ContractRecord['settlement']): RentalContract['settlement'] {
  if (!item) return null;
  return {
    chargesVnd: item.chargesVnd,
    depositAppliedVnd: item.depositAppliedVnd,
    depositRefunded: item.depositRefunded,
    depositVnd: item.depositVnd,
    discountsVnd: item.discountsVnd,
    documentReturned: item.documentReturned,
    id: item.id,
    notes: item.notes,
    outstandingVnd: item.outstandingVnd,
    paidVnd: item.paidVnd,
    receivableVnd: item.receivableVnd,
    refundVnd: item.refundVnd,
    settledAt: item.settledAt.toISOString(),
    settledById: item.settledById,
    totalDueVnd: item.totalDueVnd,
  };
}

const iso = (value: Date | null): string | null => value?.toISOString() ?? null;

export function mapRecord(item: ContractRecord): RentalContract {
  const lines = item.lines.map((line) => mapLine(line, item.charges));
  const fallback = item.createdAt.toISOString();
  const bounds = lines.length ? quoteBounds(lines) : { endAt: fallback, startAt: fallback };
  return {
    activatedAt: iso(item.activatedAt),
    cancellationReason: item.cancellationReason,
    cancelledAt: iso(item.cancelledAt),
    cancelledById: item.cancelledById,
    charges: item.charges.map(mapCharge),
    code: item.code,
    completedAt: iso(item.completedAt),
    createdAt: fallback,
    customerId: item.customerId,
    events: item.events.map(mapEvent),
    handover: mapHandover(item.handover),
    id: item.id,
    overdueSince: iso(item.overdueSince),
    quote: {
      customerName: item.customerNameSnapshot,
      deliveryFeeVnd: item.deliveryFeeVnd,
      lines,
      totalVnd: item.totalVnd,
      ...bounds,
    },
    settledAt: iso(item.settledAt),
    settlement: mapSettlement(item.settlement),
    status: contractStatusSchema.parse(item.status),
  };
}

export interface LineInterval {
  endAt: string;
  startAt: string;
}

export function lineData(line: QuoteLine, interval: LineInterval) {
  return {
    adjustmentPercent: line.adjustmentPercent,
    baseSubtotalVnd: line.baseSubtotalVnd,
    billableDays: line.billableDays,
    dailyRateVnd: line.dailyRateVnd,
    endAt: new Date(interval.endAt),
    explanation: line.explanation,
    finalSubtotalVnd: line.finalSubtotalVnd,
    lateReturnGraceMinutes: line.lateReturnPolicy.graceMinutes,
    lateReturnHourlyRateVnd: line.lateReturnPolicy.hourlyRateVnd,
    overrideReason: line.overrideReason,
    pricingVersionId: line.pricingVersionId,
    startAt: new Date(interval.startAt),
    vehicleId: line.vehicleId,
  };
}
