import {
  DEFAULT_LATE_RETURN_POLICY,
  businessDayKey,
  type ContractEvent,
  type ContractLine,
  type RentalContract,
} from '@rental/contracts';
import type { StoredContract } from './demo-contract.repository.js';

const BUSINESS_OFFSET = '+07:00';
const DAY_MS = 86_400_000;
const SCOOTER_DAILY_RATE = 150_000;
const DEMO_DEPOSIT_VND = 1_000_000;
const DEMO_FUEL_PERCENT = 80;
const RESERVATION_DAYS = 3;
const DEMO_ACTOR = 'demo-staff';
const DEMO_HANDOVER: RentalContract['handover'] = {
  deliveryPlace: 'Cửa hàng',
  depositVnd: DEMO_DEPOSIT_VND,
  fuelPercent: DEMO_FUEL_PERCENT,
  imageCount: 0,
  notes: 'Dữ liệu minh họa',
  retainedDocument: 'CCCD ••••0000',
};

interface SeedSpec {
  code: string;
  customerName: string;
  days: number;
  endAt: string;
  id: string;
  startAt: string;
  status: 'ACTIVE' | 'CONFIRMED';
  vehicleCode: string;
  vehicleId: string;
}

/** Builds an instant for a business-day (Asia/Ho_Chi_Minh) clock time, persisted as UTC. */
function businessTime(now: Date, dayOffset: number, clock: string): string {
  const day = businessDayKey(new Date(now.getTime() + dayOffset * DAY_MS));
  return new Date(`${day}T${clock}:00${BUSINESS_OFFSET}`).toISOString();
}

function seedLine(spec: SeedSpec): ContractLine {
  const subtotal = spec.days * SCOOTER_DAILY_RATE;
  return {
    adjustmentPercent: 0,
    baseSubtotalVnd: subtotal,
    billableDays: spec.days,
    dailyRateVnd: SCOOTER_DAILY_RATE,
    endAt: spec.endAt,
    explanation: `${spec.days} ngày × ${SCOOTER_DAILY_RATE.toLocaleString('vi-VN')} ₫ · bảng giá v1`,
    finalSubtotalVnd: subtotal,
    id: `${spec.id}-line-1`,
    inspection: null,
    lateReturnPolicy: DEFAULT_LATE_RETURN_POLICY,
    pricingVersionId: 'pricing-scooter-v1',
    pricingVersionNumber: 1,
    replacedByLineId: null,
    replacesLineId: null,
    startAt: spec.startAt,
    vehicleCode: spec.vehicleCode,
    vehicleId: spec.vehicleId,
  };
}

function seedEvents(spec: SeedSpec, createdAt: string): ContractEvent[] {
  const base = { actorId: DEMO_ACTOR, metadata: {}, reason: null };
  const events: ContractEvent[] = [
    { ...base, id: `${spec.id}-created`, occurredAt: createdAt, type: 'CREATED' },
  ];
  if (spec.status === 'ACTIVE') {
    events.push({
      ...base,
      id: `${spec.id}-activated`,
      occurredAt: spec.startAt,
      type: 'ACTIVATED',
    });
  }
  return events;
}

/** Demo contracts never carry cancellations, charges or settlements when seeded. */
const UNTOUCHED_CONTRACT = {
  cancellationReason: null,
  cancelledAt: null,
  cancelledById: null,
  charges: [],
  completedAt: null,
  overdueSince: null,
  payments: [],
  settledAt: null,
  settlement: null,
} as const;

function seedContract(spec: SeedSpec): StoredContract {
  const line = seedLine(spec);
  const createdAt = new Date(Date.parse(spec.startAt) - DAY_MS).toISOString();
  const contract: RentalContract = {
    ...UNTOUCHED_CONTRACT,
    activatedAt: spec.status === 'ACTIVE' ? spec.startAt : null,
    charges: [],
    code: spec.code,
    createdAt,
    customerId: 'demo-customer',
    events: seedEvents(spec, createdAt),
    handover: DEMO_HANDOVER,
    id: spec.id,
    payments: [],
    quote: {
      customerName: spec.customerName,
      deliveryFeeVnd: 0,
      endAt: spec.endAt,
      lines: [line],
      startAt: spec.startAt,
      totalVnd: line.finalSubtotalVnd,
    },
    status: spec.status,
  };
  return { contract, idempotencyKey: `seed:${spec.id}`, imageObjectKeys: [] };
}

/** Synthetic contracts that keep the demo fleet (XE-002 rented, XE-003 reserved) coherent. */
export function demoContractSeeds(now: Date): StoredContract[] {
  return [
    seedContract({
      code: 'HD-2026-DEMO0001',
      customerName: 'Khách hàng mẫu',
      days: 1,
      endAt: businessTime(now, 0, '18:00'),
      id: 'demo-contract-01',
      startAt: businessTime(now, -1, '18:00'),
      status: 'ACTIVE',
      vehicleCode: 'XE-002',
      vehicleId: 'vehicle-002',
    }),
    seedContract({
      code: 'HD-2026-DEMO0002',
      customerName: 'Khách VIP mẫu',
      days: RESERVATION_DAYS,
      endAt: businessTime(now, RESERVATION_DAYS, '20:00'),
      id: 'demo-contract-02',
      startAt: businessTime(now, 0, '20:00'),
      status: 'CONFIRMED',
      vehicleCode: 'XE-003',
      vehicleId: 'vehicle-003',
    }),
  ];
}
