import type {
  ContractCharge,
  ContractLine,
  ContractSettlement,
  ContractStatus,
  RentalContract,
  Vehicle,
  VehicleInspection,
} from '@rental/contracts';

const DAILY_RATE = 150_000;
const DEFAULT_START = '2026-10-01T08:00:00.000Z';
const DEFAULT_END = '2026-10-06T08:00:00.000Z';
const CLOSED_STAMPS = {
  activatedAt: null,
  cancellationReason: null,
  cancelledAt: null,
  cancelledById: null,
  overdueSince: null,
};
const HANDOVER = {
  deliveryPlace: 'Cửa hàng',
  depositVnd: 0,
  fuelPercent: 100,
  imageCount: 0,
  notes: '',
  retainedDocument: '',
};

export function inspectionFixture(overrides: Partial<VehicleInspection> = {}): VehicleInspection {
  return {
    actualReturnAt: DEFAULT_END,
    condition: 'GOOD',
    fuelPercent: 50,
    imageCount: 0,
    lateFeeVnd: 0,
    notes: '',
    returnedById: 'staff-1',
    ...overrides,
  };
}

export function chargeFixture(overrides: Partial<ContractCharge> = {}): ContractCharge {
  return {
    actorId: 'staff-1',
    amountVnd: 40_000,
    createdAt: DEFAULT_END,
    description: 'Trả trễ 150 phút · 2 giờ tính phí',
    id: 'charge-1',
    kind: 'LATE_RETURN',
    lineId: 'line-1',
    vehicleCode: 'XE-001',
    ...overrides,
  };
}

export function settlementFixture(overrides: Partial<ContractSettlement> = {}): ContractSettlement {
  return {
    chargesVnd: 190_000,
    depositAppliedVnd: 190_000,
    depositRefunded: true,
    depositVnd: 500_000,
    discountsVnd: 0,
    documentReturned: true,
    id: 'settlement-1',
    notes: '',
    outstandingVnd: 190_000,
    paidVnd: 0,
    receivableVnd: 0,
    refundVnd: 310_000,
    settledAt: '2026-10-06T09:00:00.000Z',
    settledById: 'staff-1',
    totalDueVnd: 190_000,
    ...overrides,
  };
}

export function contractLine(overrides: Partial<ContractLine> = {}): ContractLine {
  return {
    adjustmentPercent: 0,
    baseSubtotalVnd: DAILY_RATE,
    billableDays: 1,
    dailyRateVnd: DAILY_RATE,
    endAt: DEFAULT_END,
    explanation: '1 ngày × 150.000 ₫ · bảng giá v1',
    finalSubtotalVnd: DAILY_RATE,
    id: 'line-1',
    inspection: null,
    lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
    pricingVersionId: 'pricing-scooter-v1',
    pricingVersionNumber: 1,
    replacedByLineId: null,
    replacesLineId: null,
    startAt: DEFAULT_START,
    vehicleCode: 'XE-001',
    vehicleId: 'vehicle-001',
    ...overrides,
  };
}

interface ContractOverrides {
  charges?: ContractCharge[];
  code?: string;
  completedAt?: string | null;
  deliveryFeeVnd?: number;
  depositVnd?: number;
  endAt?: string;
  lines?: ContractLine[];
  retainedDocument?: string;
  settlement?: ContractSettlement | null;
  startAt?: string;
  status?: ContractStatus;
}

function fixtureHandover(overrides: ContractOverrides): RentalContract['handover'] {
  return {
    ...HANDOVER,
    depositVnd: overrides.depositVnd ?? 0,
    retainedDocument: overrides.retainedDocument ?? '',
  };
}

function fixtureQuote(overrides: ContractOverrides): RentalContract['quote'] {
  const startAt = overrides.startAt ?? DEFAULT_START;
  const endAt = overrides.endAt ?? DEFAULT_END;
  const lines = overrides.lines ?? [contractLine({ endAt, startAt })];
  return {
    customerName: 'Khách hàng mẫu',
    deliveryFeeVnd: overrides.deliveryFeeVnd ?? 0,
    endAt,
    lines,
    startAt,
    totalVnd: lines.reduce((sum, line) => sum + line.finalSubtotalVnd, 0),
  };
}

export function contractFixture(overrides: ContractOverrides = {}): RentalContract {
  const code = overrides.code ?? 'HD-2026-TEST0001';
  const settlement = overrides.settlement ?? null;
  return {
    ...CLOSED_STAMPS,
    charges: overrides.charges ?? [],
    code,
    completedAt: overrides.completedAt ?? null,
    createdAt: '2026-09-30T08:00:00.000Z',
    customerId: 'demo-customer',
    events: [],
    handover: fixtureHandover(overrides),
    id: code.toLowerCase(),
    quote: fixtureQuote(overrides),
    settledAt: settlement?.settledAt ?? null,
    settlement,
    status: overrides.status ?? 'CONFIRMED',
  };
}

export function vehicleFixture(overrides: Partial<Vehicle> = {}): Vehicle {
  return {
    code: 'XE-001',
    color: 'Trắng',
    createdAt: '2026-08-02T03:00:00.000Z',
    id: 'vehicle-001',
    model: 'Vision',
    plate: '43A1-000.01',
    status: 'AVAILABLE',
    typeCode: 'SCOOTER',
    year: 2025,
    ...overrides,
  };
}
