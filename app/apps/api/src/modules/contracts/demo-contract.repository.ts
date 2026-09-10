import { Inject, Injectable, Optional } from '@nestjs/common';
import type {
  AvailabilityConflict,
  AvailabilityInput,
  ContractListQuery,
  ContractSummary,
  RentalContract,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { ReservationRegistry } from '../../common/reservations/reservation-registry.js';
import {
  holdFromStatuses,
  isOpenContract,
  openLines,
  quoteBounds,
  type VehicleHold,
} from './contract-lifecycle.policy.js';
import { contractSummary, matchesContractQuery, sortNewestFirst } from './contract-view.js';
import { DEMO_CONTRACT_SEEDS } from './contract.tokens.js';
import type {
  ChargeDraft,
  ContractDraft,
  ContractRepository,
  ExtensionChange,
  LifecycleEventInput,
  LifecyclePatch,
  PaymentDraft,
  ReturnChange,
  SettlementDraft,
  SwapChange,
} from './contract.types.js';
import {
  buildCharge,
  buildContract,
  buildEvent,
  buildPayment,
  buildSettlement,
  reservationEntries,
} from './demo-contract.builders.js';

export interface StoredContract {
  contract: RentalContract;
  idempotencyKey: string;
  imageObjectKeys: string[];
  /** Private inspection image keys per line; only counted in API responses. */
  returnImageObjectKeys?: Record<string, string[]>;
}

@Injectable()
export class DemoContractRepository implements ContractRepository {
  private readonly contracts: StoredContract[];

  constructor(
    private readonly reservations: ReservationRegistry,
    @Optional() @Inject(DEMO_CONTRACT_SEEDS) seeds: StoredContract[] = [],
  ) {
    this.contracts = seeds.map((seed) => structuredClone(seed));
    this.contracts.forEach((item) => this.syncReservations(item.contract));
  }

  createAtomic(draft: ContractDraft): Promise<RentalContract> {
    const existing = this.contracts.find((item) => item.idempotencyKey === draft.idempotencyKey);
    if (existing) return Promise.resolve(structuredClone(existing.contract));
    const conflicts = this.reservations.conflicts({
      endAt: draft.quote.endAt,
      startAt: draft.quote.startAt,
      vehicleIds: draft.quote.lines.map((line) => line.vehicleId),
    });
    if (conflicts.length) throw new DomainError('CONFLICT', this.conflictMessage(conflicts));
    const contract = buildContract(draft);
    this.contracts.push({
      contract,
      idempotencyKey: draft.idempotencyKey,
      imageObjectKeys: [...draft.handover.imageObjectKeys],
    });
    this.syncReservations(contract);
    return Promise.resolve(structuredClone(contract));
  }

  applyLifecycle(id: string, patch: LifecyclePatch, event: LifecycleEventInput) {
    const contract = this.require(id).contract;
    Object.assign(contract, patch);
    contract.events.push(buildEvent(event));
    this.syncReservations(contract);
    return Promise.resolve(structuredClone(contract));
  }

  extend(id: string, change: ExtensionChange, event: LifecycleEventInput) {
    const contract = this.require(id).contract;
    change.lines.forEach((repriced) => {
      const line = contract.quote.lines.find((item) => item.id === repriced.id);
      if (!line) throw new DomainError('NOT_FOUND', 'Không tìm thấy dòng xe cần gia hạn');
      Object.assign(line, repriced, { endAt: change.endAt });
      delete line.overrideReason;
    });
    contract.quote.endAt = change.endAt;
    contract.quote.totalVnd = change.totalVnd;
    contract.status = change.status;
    contract.events.push(buildEvent(event));
    this.syncReservations(contract);
    return Promise.resolve(structuredClone(contract));
  }

  swap(id: string, change: SwapChange, event: LifecycleEventInput) {
    const contract = this.require(id).contract;
    const closed = contract.quote.lines.find((item) => item.id === change.closedLineId);
    if (!closed) throw new DomainError('NOT_FOUND', 'Không tìm thấy dòng xe cần đổi');
    closed.endAt = change.swapAt;
    closed.replacedByLineId = change.replacement.id;
    contract.quote.lines.push({ ...change.replacement, replacedByLineId: null });
    Object.assign(contract.quote, quoteBounds(contract.quote.lines));
    contract.events.push(buildEvent(event));
    this.syncReservations(contract);
    return Promise.resolve(structuredClone(contract));
  }

  returnLine(id: string, change: ReturnChange, events: LifecycleEventInput[]) {
    const stored = this.require(id);
    const { contract } = stored;
    const line = contract.quote.lines.find((item) => item.id === change.lineId);
    const [first] = events;
    if (!line || !first) throw new DomainError('NOT_FOUND', 'Không tìm thấy dòng xe cần trả');
    const { imageObjectKeys, ...inspection } = change.inspection;
    line.inspection = { ...inspection, imageCount: imageObjectKeys.length };
    stored.returnImageObjectKeys = { ...stored.returnImageObjectKeys, [line.id]: imageObjectKeys };
    change.charges.forEach((draft) =>
      contract.charges.push(buildCharge(draft, first.actorId, first.occurredAt)),
    );
    if (change.completedAt) {
      contract.completedAt = change.completedAt;
      contract.status = 'COMPLETED';
    }
    events.forEach((event) => contract.events.push(buildEvent(event)));
    this.syncReservations(contract);
    return Promise.resolve(structuredClone(contract));
  }

  addCharge(id: string, draft: ChargeDraft, event: LifecycleEventInput) {
    const contract = this.require(id).contract;
    contract.charges.push(buildCharge(draft, event.actorId, event.occurredAt));
    contract.events.push(buildEvent(event));
    return Promise.resolve(structuredClone(contract));
  }

  addPayment(id: string, draft: PaymentDraft, event: LifecycleEventInput) {
    const contract = this.require(id).contract;
    contract.payments.push(buildPayment(draft));
    contract.events.push(buildEvent(event));
    return Promise.resolve(structuredClone(contract));
  }

  settle(id: string, draft: SettlementDraft, event: LifecycleEventInput) {
    const contract = this.require(id).contract;
    contract.settlement = buildSettlement(draft);
    contract.settledAt = draft.settledAt;
    contract.events.push(buildEvent(event));
    return Promise.resolve(structuredClone(contract));
  }

  findById(id: string): Promise<RentalContract | null> {
    const item = this.contracts.find((stored) => stored.contract.id === id);
    return Promise.resolve(item ? structuredClone(item.contract) : null);
  }

  findByIdempotencyKey(key: string): Promise<RentalContract | null> {
    const item = this.contracts.find((stored) => stored.idempotencyKey === key);
    return Promise.resolve(item ? structuredClone(item.contract) : null);
  }

  findByPaymentKey(key: string): Promise<RentalContract | null> {
    const item = this.contracts.find((stored) =>
      stored.contract.payments.some((payment) => payment.id === key),
    );
    return Promise.resolve(item ? structuredClone(item.contract) : null);
  }

  findConflicts(input: AvailabilityInput): Promise<AvailabilityConflict[]> {
    return Promise.resolve(this.reservations.conflicts(input));
  }

  imageObjectKeys(id: string): Promise<string[]> {
    return Promise.resolve([
      ...(this.contracts.find((item) => item.contract.id === id)?.imageObjectKeys ?? []),
    ]);
  }

  list(query: ContractListQuery): Promise<ContractSummary[]> {
    const summaries = this.contracts.map((item) => contractSummary(item.contract));
    return Promise.resolve(
      sortNewestFirst(summaries.filter((summary) => matchesContractQuery(summary, query))),
    );
  }

  listFinancial(): Promise<RentalContract[]> {
    return Promise.resolve(
      this.contracts
        .filter((item) => item.contract.status !== 'CANCELLED')
        .map((item) => structuredClone(item.contract)),
    );
  }

  listOpen(): Promise<RentalContract[]> {
    return Promise.resolve(
      this.contracts
        .filter((item) => isOpenContract(item.contract.status))
        .map((item) => structuredClone(item.contract)),
    );
  }

  vehicleHold(vehicleId: string): Promise<VehicleHold> {
    const statuses = this.contracts
      .filter(
        (item) =>
          isOpenContract(item.contract.status) &&
          openLines(item.contract.quote.lines).some((line) => line.vehicleId === vehicleId),
      )
      .map((item) => item.contract.status);
    return Promise.resolve(holdFromStatuses(statuses));
  }

  private require(id: string): StoredContract {
    const item = this.contracts.find((stored) => stored.contract.id === id);
    if (!item) throw new DomainError('NOT_FOUND', 'Không tìm thấy hợp đồng');
    return item;
  }

  private syncReservations(contract: RentalContract) {
    this.reservations.sync(contract.code, reservationEntries(contract));
  }

  private conflictMessage(conflicts: AvailabilityConflict[]): string {
    return `Xe ${conflicts.map((item) => item.vehicleId).join(', ')} vừa có lịch thuê trùng thời gian`;
  }
}
