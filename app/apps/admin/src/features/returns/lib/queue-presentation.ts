import type {
  ReturnQueue,
  ReturnQueueItem,
  ReturnQueueKind,
  ReturnQueueLine,
} from '@rental/contracts';
import type { ReturnTarget } from '@/features/contracts';

export type QueueTone = 'danger' | 'info' | 'neutral' | 'success' | 'warning';

export interface QueueSection {
  kind: ReturnQueueKind;
  labelKey: string;
}

export interface QueueHighlights {
  maxHoursLate: number;
  nearestDueAt: string | null;
  vehiclesOut: number;
}

/** Overdue first, then today, then later — the same order staff should work through. */
export const QUEUE_SECTIONS: QueueSection[] = [
  { kind: 'OVERDUE', labelKey: 'overdue' },
  { kind: 'DUE_TODAY', labelKey: 'dueToday' },
  { kind: 'LATER', labelKey: 'returnQueueLater' },
];

export const KIND_TONES: Record<ReturnQueueKind, QueueTone> = {
  DUE_TODAY: 'warning',
  LATER: 'info',
  OVERDUE: 'danger',
};

export const KIND_LABEL_KEYS: Record<ReturnQueueKind, string> = {
  DUE_TODAY: 'returnQueueLineKind.DUE_TODAY',
  LATER: 'returnQueueLineKind.LATER',
  OVERDUE: 'returnQueueLineKind.OVERDUE',
};

export function groupQueue(
  items: readonly ReturnQueueItem[],
): Record<ReturnQueueKind, ReturnQueueItem[]> {
  return {
    DUE_TODAY: items.filter((item) => item.kind === 'DUE_TODAY'),
    LATER: items.filter((item) => item.kind === 'LATER'),
    OVERDUE: items.filter((item) => item.kind === 'OVERDUE'),
  };
}

export function queueHighlights(queue: ReturnQueue): QueueHighlights {
  const lines = queue.items.flatMap((item) => item.lines);
  const dueToday = lines.filter((line) => line.kind === 'DUE_TODAY').map((line) => line.endAt);
  return {
    maxHoursLate: Math.max(0, ...lines.map((line) => line.hoursLate)),
    nearestDueAt: dueToday.length ? ([...dueToday].sort()[0] ?? null) : null,
    vehiclesOut: lines.length,
  };
}

export function queueReturnTarget(line: ReturnQueueLine): ReturnTarget {
  return {
    endAt: line.endAt,
    id: line.lineId,
    lateReturnPolicy: line.lateReturnPolicy,
    vehicleCode: line.vehicleCode,
  };
}
