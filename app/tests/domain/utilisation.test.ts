import type { RentalContract, VehicleInspection, VehicleType } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import { analyticsWindow } from '../../apps/api/src/modules/analytics/analytics-window';
import {
  buildUtilisation,
  occupiedIntervals,
} from '../../apps/api/src/modules/analytics/utilisation.policy';
import {
  contractFixture,
  contractLine,
  inspectionFixture,
  vehicleFixture,
} from './support/contract-fixture';

const MAY = analyticsWindow({ from: '2026-05-01', to: '2026-05-31' });
const TYPES: VehicleType[] = [
  { code: 'SCOOTER', createdAt: '2026-01-01T00:00:00.000Z', id: 'type-scooter', name: 'Xe tay ga' },
];

function activeContract(
  startAt: string,
  endAt: string,
  extra: { inspection?: VehicleInspection; vehicleId?: string } = {},
): RentalContract {
  const vehicleId = extra.vehicleId ?? 'vehicle-001';
  return {
    ...contractFixture({
      code: `HD-${vehicleId}`,
      lines: [
        contractLine({
          endAt,
          inspection: extra.inspection ?? null,
          startAt,
          vehicleCode: vehicleId.toUpperCase(),
          vehicleId,
        }),
      ],
      status: 'ACTIVE',
    }),
    activatedAt: startAt,
  };
}

describe('Scenario Outline: Utilisation counts occupied days over available days inside the window', () => {
  const example = (
    createdOn: string,
    line: [string, string],
    expected: [number, number, number],
  ) => ({
    createdOn,
    expected,
    line,
  });
  it.each([
    example('2026-01-01', ['2026-05-10T01:00:00Z', '2026-05-13T01:00:00Z'], [3, 31, 9]),
    example('2026-01-01', ['2026-04-28T01:00:00Z', '2026-05-03T01:00:00Z'], [2, 31, 6]),
    example('2026-05-16', ['2026-05-20T01:00:00Z', '2026-06-05T01:00:00Z'], [12, 16, 75]),
    example('2026-06-01', ['2026-06-02T01:00:00Z', '2026-06-03T01:00:00Z'], [0, 0, 0]),
  ])(
    'vehicle created $createdOn with a line $line shows $expected',
    ({ createdOn, expected, line }) => {
      const [rented, available, percent] = expected;
      const vehicle = vehicleFixture({ createdAt: `${createdOn}T03:00:00.000Z` });
      const utilisation = buildUtilisation({
        intervals: occupiedIntervals([activeContract(line[0], line[1])]),
        types: TYPES,
        vehicles: [vehicle],
        window: MAY,
      });
      expect(utilisation.byVehicle).toEqual([
        {
          availableDays: available,
          key: 'vehicle-001',
          label: 'XE-001',
          rentedDays: rented,
          utilisationPercent: percent,
        },
      ]);
    },
  );
});

describe('Scenario: A returned line stops occupying the vehicle at the actual return', () => {
  const returned = activeContract('2026-05-10T01:00:00Z', '2026-05-16T01:00:00Z', {
    inspection: inspectionFixture({ actualReturnAt: '2026-05-12T01:00:00Z' }),
  });
  const other = activeContract('2026-05-20T01:00:00Z', '2026-05-25T01:00:00Z', {
    vehicleId: 'vehicle-002',
  });
  const vehicles = [
    vehicleFixture({ createdAt: '2026-01-01T03:00:00.000Z' }),
    vehicleFixture({ code: 'XE-002', createdAt: '2026-05-11T03:00:00.000Z', id: 'vehicle-002' }),
  ];
  const utilisation = buildUtilisation({
    intervals: occupiedIntervals([returned, other]),
    types: TYPES,
    vehicles,
    window: MAY,
  });

  it('counts two rented days for the early return and sums per type and fleet', () => {
    expect(utilisation.byVehicle).toEqual([
      {
        availableDays: 31,
        key: 'vehicle-001',
        label: 'XE-001',
        rentedDays: 2,
        utilisationPercent: 6,
      },
      {
        availableDays: 21,
        key: 'vehicle-002',
        label: 'XE-002',
        rentedDays: 5,
        utilisationPercent: 23,
      },
    ]);
    expect(utilisation.byType).toEqual([
      {
        availableDays: 52,
        key: 'SCOOTER',
        label: 'Xe tay ga',
        rentedDays: 7,
        utilisationPercent: 13,
      },
    ]);
    expect(utilisation.fleet).toEqual({ availableDays: 52, rentedDays: 7, utilisationPercent: 13 });
  });

  it('stops a swapped line at the replacement start and ignores bookings', () => {
    const swapped: RentalContract = {
      ...returned,
      quote: {
        ...returned.quote,
        lines: [
          contractLine({
            endAt: '2026-05-16T01:00:00Z',
            id: 'line-1',
            replacedByLineId: 'line-2',
            startAt: '2026-05-10T01:00:00Z',
          }),
          contractLine({
            endAt: '2026-05-16T01:00:00Z',
            id: 'line-2',
            replacesLineId: 'line-1',
            startAt: '2026-05-11T01:00:00Z',
            vehicleCode: 'XE-002',
            vehicleId: 'vehicle-002',
          }),
        ],
      },
    };
    const booking = contractFixture({ code: 'HD-BOOK', lines: [contractLine()] });
    const intervals = occupiedIntervals([swapped, booking]);
    expect(intervals.get('vehicle-001')).toEqual([
      { endAt: Date.parse('2026-05-11T01:00:00Z'), startAt: Date.parse('2026-05-10T01:00:00Z') },
    ]);
    expect(intervals.get('vehicle-002')).toHaveLength(1);
    expect(intervals.size).toBe(2);
  });
});
