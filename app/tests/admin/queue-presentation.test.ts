import type { ReturnQueue } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  groupQueue,
  queueHighlights,
  queueReturnTarget,
} from '../../apps/admin/src/features/returns/lib/queue-presentation';

const QUEUE: ReturnQueue = {
  dueToday: 1,
  generatedAt: '2026-10-06T03:00:00.000Z',
  items: [
    {
      code: 'HD-LATE',
      contractId: 'hd-late',
      customerName: 'Khách A',
      depositVnd: 500_000,
      hoursLate: 19,
      kind: 'OVERDUE',
      lines: [
        {
          endAt: '2026-10-05T08:00:00.000Z',
          hoursLate: 19,
          kind: 'OVERDUE',
          lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
          lineId: 'line-1',
          vehicleCode: 'XE-001',
          vehicleId: 'vehicle-001',
        },
        {
          endAt: '2026-10-06T10:00:00.000Z',
          hoursLate: 0,
          kind: 'DUE_TODAY',
          lateReturnPolicy: { graceMinutes: 60, hourlyRateVnd: 20_000 },
          lineId: 'line-2',
          vehicleCode: 'XE-002',
          vehicleId: 'vehicle-002',
        },
      ],
      nextDueAt: '2026-10-05T08:00:00.000Z',
      returnedCount: 0,
      status: 'OVERDUE',
      vehicleCount: 2,
    },
    {
      code: 'HD-TODAY',
      contractId: 'hd-today',
      customerName: 'Khách B',
      depositVnd: 0,
      hoursLate: 0,
      kind: 'DUE_TODAY',
      lines: [
        {
          endAt: '2026-10-06T09:00:00.000Z',
          hoursLate: 0,
          kind: 'DUE_TODAY',
          lateReturnPolicy: { graceMinutes: 30, hourlyRateVnd: 10_000 },
          lineId: 'line-3',
          vehicleCode: 'XE-003',
          vehicleId: 'vehicle-003',
        },
      ],
      nextDueAt: '2026-10-06T09:00:00.000Z',
      returnedCount: 1,
      status: 'ACTIVE',
      vehicleCount: 2,
    },
  ],
  overdue: 1,
  renting: 2,
  timeZone: 'Asia/Ho_Chi_Minh',
};

describe('Feature: Return queue presentation', () => {
  it('groups items by urgency and summarises the vehicles still out', () => {
    const groups = groupQueue(QUEUE.items);
    expect(groups.OVERDUE.map((item) => item.code)).toEqual(['HD-LATE']);
    expect(groups.DUE_TODAY.map((item) => item.code)).toEqual(['HD-TODAY']);
    expect(groups.LATER).toEqual([]);
    expect(queueHighlights(QUEUE)).toEqual({
      maxHoursLate: 19,
      nearestDueAt: '2026-10-06T09:00:00.000Z',
      vehiclesOut: 3,
    });
    expect(queueHighlights({ ...QUEUE, items: [] })).toEqual({
      maxHoursLate: 0,
      nearestDueAt: null,
      vehiclesOut: 0,
    });
    expect(queueReturnTarget(QUEUE.items[1]!.lines[0]!)).toEqual({
      endAt: '2026-10-06T09:00:00.000Z',
      id: 'line-3',
      lateReturnPolicy: { graceMinutes: 30, hourlyRateVnd: 10_000 },
      vehicleCode: 'XE-003',
    });
  });
});
