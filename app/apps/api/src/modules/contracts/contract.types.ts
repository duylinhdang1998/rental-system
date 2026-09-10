import type {
  AvailabilityConflict,
  AvailabilityInput,
  ChargeKind,
  ContractEventMetadata,
  ContractEventType,
  ContractLine,
  ContractListQuery,
  ContractStatus,
  ContractSummary,
  HandoverInput,
  Quote,
  RentalContract,
  SettlementFigures,
  VehicleInspection,
} from '@rental/contracts';
import type { VehicleHold } from './contract-lifecycle.policy.js';

export interface ContractDraft {
  actorId: string;
  code: string;
  customerId: string;
  handover: HandoverInput;
  idempotencyKey: string;
  quote: Quote;
}

export interface LifecycleEventInput {
  actorId: string;
  metadata?: ContractEventMetadata;
  occurredAt: string;
  reason?: string | null;
  type: ContractEventType;
}

export interface LifecyclePatch {
  activatedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  cancelledById?: string;
  completedAt?: string;
  overdueSince?: string;
  status: ContractStatus;
}

export interface RepricedLine {
  baseSubtotalVnd: number;
  billableDays: number;
  dailyRateVnd: number;
  explanation: string;
  finalSubtotalVnd: number;
  id: string;
}

export interface ExtensionChange {
  endAt: string;
  lines: RepricedLine[];
  status: ContractStatus;
  totalVnd: number;
}

export interface SwapChange {
  closedLineId: string;
  replacement: Omit<ContractLine, 'replacedByLineId'>;
  swapAt: string;
}

export interface ChargeDraft {
  amountVnd: number;
  description: string;
  kind: ChargeKind;
  lineId: string | null;
  metadata?: ContractEventMetadata;
  vehicleCode: string | null;
}

export interface ReturnChange {
  charges: ChargeDraft[];
  completedAt: string | null;
  inspection: Omit<VehicleInspection, 'imageCount'> & { imageObjectKeys: string[] };
  lineId: string;
}

export interface SettlementDraft extends SettlementFigures {
  depositRefunded: boolean;
  documentReturned: boolean;
  notes: string;
  settledAt: string;
  settledById: string;
}

export interface ContractRepository {
  addCharge(id: string, draft: ChargeDraft, event: LifecycleEventInput): Promise<RentalContract>;
  applyLifecycle(
    id: string,
    patch: LifecyclePatch,
    event: LifecycleEventInput,
  ): Promise<RentalContract>;
  createAtomic(draft: ContractDraft): Promise<RentalContract>;
  extend(id: string, change: ExtensionChange, event: LifecycleEventInput): Promise<RentalContract>;
  findById(id: string): Promise<RentalContract | null>;
  findByIdempotencyKey(key: string): Promise<RentalContract | null>;
  findConflicts(input: AvailabilityInput): Promise<AvailabilityConflict[]>;
  imageObjectKeys(id: string): Promise<string[]>;
  list(query: ContractListQuery): Promise<ContractSummary[]>;
  listOpen(): Promise<RentalContract[]>;
  returnLine(
    id: string,
    change: ReturnChange,
    events: LifecycleEventInput[],
  ): Promise<RentalContract>;
  settle(id: string, draft: SettlementDraft, event: LifecycleEventInput): Promise<RentalContract>;
  swap(id: string, change: SwapChange, event: LifecycleEventInput): Promise<RentalContract>;
  vehicleHold(vehicleId: string): Promise<VehicleHold>;
}
