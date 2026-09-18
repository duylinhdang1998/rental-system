import type { CashShift } from '@rental/contracts';

/** Stored shift; display names are resolved by the service, never persisted. */
export type CashShiftRecord = Omit<CashShift, 'closedByName' | 'openedByName'>;

export interface CashShiftOpenDraft {
  openedAt: string;
  openedById: string;
  openingFloatVnd: number;
}

export interface CashShiftCloseDraft {
  closedAt: string;
  closedById: string;
  countedCashVnd: number;
  expectedCashVnd: number;
  note: string;
  varianceVnd: number;
}

export interface CashShiftRepository {
  /** Freezes the close figures; the row is never touched again. */
  close(id: string, draft: CashShiftCloseDraft): Promise<CashShiftRecord>;
  /** A second OPEN shift is CASH_SHIFT_ALREADY_OPEN. */
  create(draft: CashShiftOpenDraft): Promise<CashShiftRecord>;
  findById(id: string): Promise<CashShiftRecord | null>;
  findOpen(): Promise<CashShiftRecord | null>;
  /** Newest opened first; filtered to one opener when given. */
  list(openedById?: string): Promise<CashShiftRecord[]>;
}
