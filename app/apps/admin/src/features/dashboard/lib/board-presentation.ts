import type { BoardItem, BoardItemKind, FleetSummary } from '@rental/contracts';

export type ScheduleFilter = 'ALL' | 'PICKUP' | 'RETURN';

export const SCHEDULE_FILTERS: ScheduleFilter[] = ['ALL', 'RETURN', 'PICKUP'];

const RETURN_KINDS: BoardItemKind[] = ['OVERDUE', 'DUE_TODAY'];
const PERCENT = 100;

export const KIND_TONES: Record<BoardItemKind, string> = {
  DUE_TODAY: 'bg-caution-soft text-caution',
  OVERDUE: 'bg-negative-soft text-negative',
  PICKUP_TODAY: 'bg-brand-soft text-brand',
};

export const KIND_LABEL_KEYS: Record<BoardItemKind, string> = {
  DUE_TODAY: 'priorityDueSoon',
  OVERDUE: 'priorityOverdue',
  PICKUP_TODAY: 'priorityPickup',
};

export function scheduleItems(items: readonly BoardItem[], filter: ScheduleFilter): BoardItem[] {
  const matching = items.filter((item) => {
    if (filter === 'ALL') return true;
    return filter === 'RETURN' ? RETURN_KINDS.includes(item.kind) : item.kind === 'PICKUP_TODAY';
  });
  return [...matching].sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
}

export function fleetSharePercent(fleet: FleetSummary): number {
  return fleet.total ? Math.round((fleet.available / fleet.total) * PERCENT) : 0;
}

export function rentedSharePercent(fleet: FleetSummary): number {
  return fleet.total ? Math.round((fleet.rented / fleet.total) * PERCENT) : 0;
}

export function priorityDetail(item: BoardItem): string {
  return `${item.code} · ${item.vehicleCodes.join(', ')} · ${item.customerName}`;
}
