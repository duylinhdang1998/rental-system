import { businessDayKey, hoursLate, sameBusinessDay } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  activeLines,
  canTransitionContract,
  chainStartAt,
  holdFromStatuses,
  isPastScheduledEnd,
  quoteBounds,
  statusAfterEndChange,
  transitionTarget,
} from '../../apps/api/src/modules/contracts/contract-lifecycle.policy';
import {
  boardItem,
  buildBoard,
  sortBoardItems,
} from '../../apps/api/src/modules/contracts/operations-board.policy';
import { calculateLateReturnFee } from '../../apps/api/src/modules/pricing/pricing.policy';
import { contractFixture, contractLine, vehicleFixture } from './support/contract-fixture';

describe('Feature: Contract lifecycle policy', () => {
  it.each([
    ['CONFIRMED', 'ACTIVATE', true],
    ['CONFIRMED', 'CANCEL', true],
    ['CONFIRMED', 'COMPLETE', false],
    ['ACTIVE', 'OVERDUE', true],
    ['ACTIVE', 'COMPLETE', true],
    ['ACTIVE', 'CANCEL', false],
    ['OVERDUE', 'COMPLETE', true],
    ['OVERDUE', 'ACTIVATE', false],
    ['COMPLETED', 'CANCEL', false],
    ['CANCELLED', 'ACTIVATE', false],
  ] as const)('%s + %s is allowed: %s', (from, transition, allowed) => {
    expect(canTransitionContract(from, transition)).toBe(allowed);
  });

  it('maps transitions to their target status', () => {
    expect(transitionTarget('ACTIVATE')).toBe('ACTIVE');
    expect(transitionTarget('CANCEL')).toBe('CANCELLED');
    expect(transitionTarget('COMPLETE')).toBe('COMPLETED');
    expect(transitionTarget('OVERDUE')).toBe('OVERDUE');
  });

  it('treats the scheduled end as the overdue boundary while grace only affects fees', () => {
    const endAt = '2026-10-06T08:00:00.000Z';
    expect(isPastScheduledEnd(endAt, new Date('2026-10-06T07:59:59.999Z'))).toBe(false);
    expect(isPastScheduledEnd(endAt, new Date('2026-10-06T08:00:00.000Z'))).toBe(true);
    expect(
      calculateLateReturnFee(endAt, '2026-10-06T08:30:00.000Z', {
        graceMinutes: 60,
        hourlyRateVnd: 20_000,
      }).feeVnd,
    ).toBe(0);
  });

  it('recomputes renting status after an extension without touching reservations', () => {
    const now = new Date('2026-10-07T08:00:00.000Z');
    expect(statusAfterEndChange('OVERDUE', '2026-10-08T08:00:00.000Z', now)).toBe('ACTIVE');
    expect(statusAfterEndChange('ACTIVE', '2026-10-07T07:00:00.000Z', now)).toBe('OVERDUE');
    expect(statusAfterEndChange('CONFIRMED', '2026-10-08T08:00:00.000Z', now)).toBe('CONFIRMED');
  });

  it('resolves swap chains for active lines, original start and quote bounds', () => {
    const old = contractLine({
      endAt: '2026-10-03T10:00:00.000Z',
      id: 'line-old',
      replacedByLineId: 'line-new',
    });
    const replacement = contractLine({
      id: 'line-new',
      replacesLineId: 'line-old',
      startAt: '2026-10-03T10:00:00.000Z',
      vehicleCode: 'XE-003',
      vehicleId: 'vehicle-003',
    });
    expect(activeLines([old, replacement]).map((line) => line.id)).toEqual(['line-new']);
    expect(chainStartAt(replacement, [old, replacement])).toBe('2026-10-01T08:00:00.000Z');
    expect(quoteBounds([old, replacement])).toEqual({
      endAt: '2026-10-06T08:00:00.000Z',
      startAt: '2026-10-01T08:00:00.000Z',
    });
  });

  it('derives the vehicle hold from the contracts still holding it', () => {
    expect(holdFromStatuses([])).toBe('AVAILABLE');
    expect(holdFromStatuses(['CONFIRMED'])).toBe('RESERVED');
    expect(holdFromStatuses(['CONFIRMED', 'OVERDUE'])).toBe('RENTED');
    expect(holdFromStatuses(['ACTIVE'])).toBe('RENTED');
  });
});

describe('Feature: Business time and operations board', () => {
  it('uses Asia/Ho_Chi_Minh calendar days over UTC persistence', () => {
    expect(businessDayKey('2026-10-06T16:30:00.000Z')).toBe('2026-10-06');
    expect(businessDayKey('2026-10-06T17:30:00.000Z')).toBe('2026-10-07');
    expect(sameBusinessDay('2026-10-06T16:30:00.000Z', '2026-10-06T00:00:00.000Z')).toBe(true);
    expect(hoursLate('2026-10-06T02:00:00.000Z', '2026-10-06T08:59:00.000Z')).toBe(6);
    expect(hoursLate('2026-10-06T02:00:00.000Z', '2026-10-06T01:00:00.000Z')).toBe(0);
  });

  it('separates overdue, due today and pickups today and ranks overdue first', () => {
    const now = new Date('2026-10-06T08:00:00.000Z');
    const dueToday = contractFixture({
      code: 'HD-DUE',
      endAt: '2026-10-06T16:30:00.000Z',
      status: 'ACTIVE',
    });
    const overdue = contractFixture({
      code: 'HD-LATE',
      endAt: '2026-10-06T02:00:00.000Z',
      status: 'ACTIVE',
    });
    const tomorrow = contractFixture({
      code: 'HD-NEXT',
      endAt: '2026-10-09T17:30:00.000Z',
      startAt: '2026-10-06T17:30:00.000Z',
    });
    const pickup = contractFixture({
      code: 'HD-PICK',
      endAt: '2026-10-09T10:00:00.000Z',
      startAt: '2026-10-06T10:00:00.000Z',
    });
    const board = buildBoard(
      [dueToday, overdue, tomorrow, pickup],
      [vehicleFixture(), vehicleFixture({ id: 'vehicle-002', status: 'RENTED' })],
      now,
    );
    expect(board.items.map((item) => [item.code, item.kind, item.hoursLate])).toEqual([
      ['HD-LATE', 'OVERDUE', 6],
      ['HD-DUE', 'DUE_TODAY', 0],
      ['HD-PICK', 'PICKUP_TODAY', 0],
    ]);
    expect(board).toMatchObject({
      activeRentals: 2,
      availableVehicles: 1,
      dueToday: 1,
      fleet: { available: 1, other: 0, rented: 1, total: 2 },
      maxOverdueHours: 6,
      nearestDueAt: '2026-10-06T16:30:00.000Z',
      overdue: 1,
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    expect(boardItem(contractFixture({ status: 'CANCELLED' }), now)).toBeNull();
  });

  it('sorts the latest overdue first and the nearest due time first', () => {
    const base = boardItem(
      contractFixture({ endAt: '2026-10-06T02:00:00.000Z', status: 'OVERDUE' }),
      new Date('2026-10-06T08:00:00.000Z'),
    )!;
    const sorted = sortBoardItems([
      { ...base, code: 'A', hoursLate: 2 },
      { ...base, code: 'B', dueAt: '2026-10-06T12:00:00.000Z', hoursLate: 0, kind: 'DUE_TODAY' },
      { ...base, code: 'C', hoursLate: 9 },
      { ...base, code: 'D', dueAt: '2026-10-06T10:00:00.000Z', hoursLate: 0, kind: 'DUE_TODAY' },
    ]);
    expect(sorted.map((item) => item.code)).toEqual(['C', 'A', 'D', 'B']);
  });
});
