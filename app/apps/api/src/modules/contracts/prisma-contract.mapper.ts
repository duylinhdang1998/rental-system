import type { Prisma } from '@prisma/client';
import {
  contractEventMetadataSchema,
  contractEventTypeSchema,
  contractStatusSchema,
  type ContractEvent,
  type ContractLine,
  type QuoteLine,
  type RentalContract,
} from '@rental/contracts';
import { quoteBounds } from './contract-lifecycle.policy.js';

export const CONTRACT_INCLUDE = {
  events: { orderBy: { occurredAt: 'asc' } },
  handover: true,
  lines: {
    include: { pricingVersion: true, replacedBy: { select: { id: true } }, vehicle: true },
    orderBy: { createdAt: 'asc' },
  },
} as const;

export type ContractRecord = Prisma.ContractGetPayload<{ include: typeof CONTRACT_INCLUDE }>;

export function mapLine(line: ContractRecord['lines'][number]): ContractLine {
  return {
    adjustmentPercent: line.adjustmentPercent,
    baseSubtotalVnd: line.baseSubtotalVnd,
    billableDays: line.billableDays,
    dailyRateVnd: line.dailyRateVnd,
    endAt: line.endAt.toISOString(),
    explanation: line.explanation,
    finalSubtotalVnd: line.finalSubtotalVnd,
    id: line.id,
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

const iso = (value: Date | null): string | null => value?.toISOString() ?? null;

export function mapRecord(item: ContractRecord): RentalContract {
  const lines = item.lines.map(mapLine);
  const fallback = item.createdAt.toISOString();
  const bounds = lines.length ? quoteBounds(lines) : { endAt: fallback, startAt: fallback };
  return {
    activatedAt: iso(item.activatedAt),
    cancellationReason: item.cancellationReason,
    cancelledAt: iso(item.cancelledAt),
    cancelledById: item.cancelledById,
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
