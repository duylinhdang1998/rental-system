import type { ContractLine, ContractStatus, RentalContract, Vehicle } from '@rental/contracts';

const DAILY_RATE = 150_000;
const DEFAULT_START = '2026-10-01T08:00:00.000Z';
const DEFAULT_END = '2026-10-06T08:00:00.000Z';
const CLOSED_STAMPS = {
  activatedAt: null,
  cancellationReason: null,
  cancelledAt: null,
  cancelledById: null,
  completedAt: null,
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
  code?: string;
  endAt?: string;
  lines?: ContractLine[];
  startAt?: string;
  status?: ContractStatus;
}

export function contractFixture(overrides: ContractOverrides = {}): RentalContract {
  const startAt = overrides.startAt ?? DEFAULT_START;
  const endAt = overrides.endAt ?? DEFAULT_END;
  const lines = overrides.lines ?? [contractLine({ endAt, startAt })];
  const code = overrides.code ?? 'HD-2026-TEST0001';
  return {
    ...CLOSED_STAMPS,
    code,
    createdAt: '2026-09-30T08:00:00.000Z',
    customerId: 'demo-customer',
    events: [],
    handover: { ...HANDOVER },
    id: code.toLowerCase(),
    quote: {
      customerName: 'Khách hàng mẫu',
      deliveryFeeVnd: 0,
      endAt,
      lines,
      startAt,
      totalVnd: lines.reduce((sum, line) => sum + line.finalSubtotalVnd, 0),
    },
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
