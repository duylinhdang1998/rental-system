import { describe, expect, it } from 'vitest';
import {
  buildReturnQueue,
  compareUrgency,
  queueItem,
  queueLine,
} from '../../apps/api/src/modules/contracts/return-queue.policy';
import { contractFixture, contractLine, inspectionFixture } from './support/contract-fixture';

/** 10:00 on 2026-10-06 in Asia/Ho_Chi_Minh. */
const NOW = new Date('2026-10-06T03:00:00.000Z');

describe('Feature: Return queue policy (business time)', () => {
  it('classifies each open line as overdue, due today or later', () => {
    const overdue = queueLine(contractLine({ endAt: '2026-10-05T08:00:00.000Z' }), NOW);
    expect(overdue).toMatchObject({ hoursLate: 19, kind: 'OVERDUE', vehicleCode: 'XE-001' });
    expect(overdue.lateReturnPolicy).toEqual({ graceMinutes: 60, hourlyRateVnd: 20_000 });
    expect(queueLine(contractLine({ endAt: '2026-10-06T10:00:00.000Z' }), NOW)).toMatchObject({
      hoursLate: 0,
      kind: 'DUE_TODAY',
    });
    expect(queueLine(contractLine({ endAt: '2026-10-06T18:00:00.000Z' }), NOW)).toMatchObject({
      kind: 'LATER',
    });
  });

  it('orders overdue by lateness, then everything else by nearest scheduled end', () => {
    const later = { endAt: '2026-10-08T08:00:00.000Z', hoursLate: 0, kind: 'LATER' as const };
    const today = { endAt: '2026-10-06T10:00:00.000Z', hoursLate: 0, kind: 'DUE_TODAY' as const };
    const late = { endAt: '2026-10-05T08:00:00.000Z', hoursLate: 19, kind: 'OVERDUE' as const };
    const later2 = { endAt: '2026-10-04T08:00:00.000Z', hoursLate: 43, kind: 'OVERDUE' as const };
    expect([later, today, late, later2].sort(compareUrgency)).toEqual([later2, late, today, later]);
  });

  it('keeps only renting contracts and counts returned vehicles per contract', () => {
    const mixed = contractFixture({
      code: 'HD-MIXED',
      lines: [
        contractLine({ endAt: '2026-10-08T08:00:00.000Z', inspection: inspectionFixture() }),
        contractLine({ endAt: '2026-10-05T08:00:00.000Z', id: 'line-2', vehicleCode: 'XE-002' }),
        contractLine({ endAt: '2026-10-06T10:00:00.000Z', id: 'line-3', vehicleCode: 'XE-003' }),
      ],
      status: 'OVERDUE',
    });
    const item = queueItem(mixed, NOW);
    expect(item).toMatchObject({
      code: 'HD-MIXED',
      hoursLate: 19,
      kind: 'OVERDUE',
      nextDueAt: '2026-10-05T08:00:00.000Z',
      returnedCount: 1,
      vehicleCount: 3,
    });
    expect(item?.lines.map((line) => line.vehicleCode)).toEqual(['XE-002', 'XE-003']);
    expect(queueItem(contractFixture({ status: 'CONFIRMED' }), NOW)).toBeNull();
    expect(queueItem(contractFixture({ status: 'COMPLETED' }), NOW)).toBeNull();
    const allReturned = contractFixture({
      lines: [contractLine({ inspection: inspectionFixture() })],
      status: 'ACTIVE',
    });
    expect(queueItem(allReturned, NOW)).toBeNull();
  });

  it('builds the queue overdue first with line-based counters', () => {
    const queue = buildReturnQueue(
      [
        contractFixture({ code: 'HD-LATER', endAt: '2026-10-08T08:00:00.000Z', status: 'ACTIVE' }),
        contractFixture({ code: 'HD-TODAY', endAt: '2026-10-06T10:00:00.000Z', status: 'ACTIVE' }),
        contractFixture({ code: 'HD-LATE', endAt: '2026-10-05T08:00:00.000Z', status: 'OVERDUE' }),
        contractFixture({ code: 'HD-RESERVED', status: 'CONFIRMED' }),
      ],
      NOW,
    );
    expect(queue.items.map((item) => item.code)).toEqual(['HD-LATE', 'HD-TODAY', 'HD-LATER']);
    expect(queue).toMatchObject({
      dueToday: 1,
      generatedAt: NOW.toISOString(),
      overdue: 1,
      renting: 3,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  });
});
