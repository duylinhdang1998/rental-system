import type {
  Expense,
  ExpenseCategory,
  PaymentMethod,
  VehicleAcquisition,
  VehicleAcquisitionInput,
} from '@rental/contracts';

export interface AcquisitionDraft extends VehicleAcquisitionInput {
  updatedById: string;
  vehicleId: string;
}

/** Stored ledger row; the display name is resolved by the service, never persisted. */
export type ExpenseRecord = Omit<Expense, 'recordedByName'>;

export interface ExpenseDraft {
  amountVnd: number;
  category: ExpenseCategory;
  description: string;
  idempotencyKey: string;
  method: PaymentMethod;
  notes: string;
  paidOn: string;
  recordedById: string;
  reference: string;
  reversalOfId: string | null;
  vehicleCode: string | null;
  vehicleId: string | null;
}

export interface ExpenseFilter {
  category?: ExpenseCategory;
  from?: string;
  /** Omitted → every matching row (reports); the API list always passes one. */
  limit?: number;
  to?: string;
  vehicleId?: string;
}

export interface EconomicsRepository {
  /** Append-only: a duplicate idempotency key is a CONFLICT, never an update. */
  createExpense(draft: ExpenseDraft): Promise<ExpenseRecord>;
  findAcquisition(vehicleId: string): Promise<VehicleAcquisition | null>;
  findExpense(id: string): Promise<ExpenseRecord | null>;
  findExpenseByKey(idempotencyKey: string): Promise<ExpenseRecord | null>;
  listAcquisitions(): Promise<VehicleAcquisition[]>;
  /** Newest paid day first, then newest created. */
  listExpenses(filter: ExpenseFilter): Promise<ExpenseRecord[]>;
  upsertAcquisition(draft: AcquisitionDraft): Promise<VehicleAcquisition>;
}
