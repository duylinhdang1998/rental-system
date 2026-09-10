import type { BoardItem, ContractEvent } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  activeContractLines,
  contractActions,
  contractStatusTone,
  defaultExtensionEnd,
  describeEvent,
  lifecycleRows,
  localInputToIso,
  overviewRows,
  toLocalInput,
} from '../../apps/admin/src/features/contracts/lib/contract-presentation';
import {
  fleetSharePercent,
  priorityDetail,
  rentedSharePercent,
  scheduleItems,
} from '../../apps/admin/src/features/dashboard/lib/board-presentation';
import { formatTime } from '../../apps/admin/src/shared/i18n/locale';
import { contractFixture, contractLine } from '../domain/support/contract-fixture';

function event(overrides: Partial<ContractEvent>): ContractEvent {
  return {
    actorId: 'staff-1',
    id: 'event-1',
    metadata: {},
    occurredAt: '2026-10-06T08:00:00.000Z',
    reason: null,
    type: 'CREATED',
    ...overrides,
  };
}

function boardItem(overrides: Partial<BoardItem>): BoardItem {
  return {
    code: 'HD-1',
    contractId: 'hd-1',
    customerName: 'Khách A',
    dueAt: '2026-10-06T10:00:00.000Z',
    hoursLate: 0,
    kind: 'DUE_TODAY',
    status: 'ACTIVE',
    totalVnd: 150_000,
    vehicleCodes: ['XE-001'],
    ...overrides,
  };
}

describe('Feature: Contract lifecycle presentation', () => {
  it('maps statuses to badge tones and the actions each status allows', () => {
    expect(contractStatusTone('CONFIRMED')).toBe('warning');
    expect(contractStatusTone('OVERDUE')).toBe('danger');
    expect(contractStatusTone('CANCELLED')).toBe('neutral');
    expect(contractActions('CONFIRMED')).toEqual(['activate', 'extend', 'cancel']);
    expect(contractActions('OVERDUE')).toEqual(['extend', 'swap', 'charge']);
    expect(contractActions('CANCELLED')).toEqual([]);
  });

  it('keeps only lines that were not replaced by a swap', () => {
    const lines = [
      contractLine({ id: 'old', replacedByLineId: 'new' }),
      contractLine({ id: 'new', replacesLineId: 'old', vehicleCode: 'XE-003' }),
    ];
    expect(activeContractLines(lines).map((line) => line.vehicleCode)).toEqual(['XE-003']);
  });

  it('round-trips datetime-local values and proposes one extra day', () => {
    const iso = '2026-10-06T08:00:00.000Z';
    expect(localInputToIso(toLocalInput(iso))).toBe(iso);
    expect(localInputToIso(defaultExtensionEnd(iso))).toBe('2026-10-07T08:00:00.000Z');
  });

  it('describes timeline events from their metadata', () => {
    const extended = event({
      metadata: {
        newEndAt: '2026-10-08T08:00:00.000Z',
        newTotalVnd: 700_000,
        previousEndAt: '2026-10-06T08:00:00.000Z',
        previousTotalVnd: 650_000,
      },
      reason: 'Khách ở thêm',
      type: 'EXTENDED',
    });
    expect(describeEvent(extended, 'vi')).toContain('650.000');
    expect(describeEvent(extended, 'vi')).toContain('Khách ở thêm');
    const swapped = event({
      metadata: { fromVehicleCode: 'XE-001', toVehicleCode: 'XE-003' },
      type: 'SWAPPED',
    });
    expect(describeEvent(swapped, 'vi')).toBe('XE-001 → XE-003');
    expect(describeEvent(event({ reason: 'Khách hủy', type: 'CANCELLED' }), 'vi')).toBe(
      'Khách hủy',
    );
    expect(describeEvent(event({}), 'vi')).toBe('');
  });

  it('lists overview rows and only the lifecycle stamps that exist', () => {
    const contract = {
      ...contractFixture({ status: 'CANCELLED' }),
      cancellationReason: 'Khách đổi lịch',
      cancelledAt: '2026-10-02T08:00:00.000Z',
    };
    expect(overviewRows(contract, 'vi').map((row) => row.labelKey)).toContain('contractDeposit');
    expect(lifecycleRows(contract, 'vi').map((row) => row.labelKey)).toEqual([
      'contractCancelledAt',
      'contractCancelReason',
    ]);
    expect(lifecycleRows(contractFixture(), 'vi')).toEqual([]);
  });
});

describe('Feature: Operations board presentation', () => {
  it('filters and orders schedule items by due time', () => {
    const items = [
      boardItem({ code: 'B', dueAt: '2026-10-06T12:00:00.000Z', kind: 'PICKUP_TODAY' }),
      boardItem({ code: 'A', dueAt: '2026-10-06T02:00:00.000Z', hoursLate: 6, kind: 'OVERDUE' }),
      boardItem({ code: 'C' }),
    ];
    expect(scheduleItems(items, 'ALL').map((item) => item.code)).toEqual(['A', 'C', 'B']);
    expect(scheduleItems(items, 'RETURN').map((item) => item.code)).toEqual(['A', 'C']);
    expect(scheduleItems(items, 'PICKUP').map((item) => item.code)).toEqual(['B']);
  });

  it('derives fleet shares and priority detail text', () => {
    expect(fleetSharePercent({ available: 2, other: 0, rented: 1, total: 3 })).toBe(67);
    expect(rentedSharePercent({ available: 2, other: 0, rented: 1, total: 3 })).toBe(33);
    expect(fleetSharePercent({ available: 0, other: 0, rented: 0, total: 0 })).toBe(0);
    expect(priorityDetail(boardItem({ vehicleCodes: ['XE-001', 'XE-002'] }))).toBe(
      'HD-1 · XE-001, XE-002 · Khách A',
    );
  });

  it('formats board times in business time', () => {
    expect(formatTime('2026-10-06T10:30:00.000Z', 'vi')).toBe('17:30');
    expect(formatTime('2026-10-06T16:30:00.000Z', 'en')).toBe('23:30');
  });
});
