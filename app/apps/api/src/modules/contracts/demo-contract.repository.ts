import { randomUUID } from 'node:crypto';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type {
  AvailabilityConflict,
  AvailabilityInput,
  ContractEvent,
  ContractListQuery,
  ContractSummary,
  RentalContract,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import {
  ReservationRegistry,
  type ReservationEntry,
} from '../../common/reservations/reservation-registry.js';
import {
  activeLines,
  holdFromStatuses,
  isOpenContract,
  isRentingContract,
  quoteBounds,
  type VehicleHold,
} from './contract-lifecycle.policy.js';
import { contractSummary, matchesContractQuery, sortNewestFirst } from './contract-view.js';
import { DEMO_CONTRACT_SEEDS } from './contract.tokens.js';
import type {
  ContractDraft,
  ContractRepository,
  ExtensionChange,
  LifecycleEventInput,
  LifecyclePatch,
  SwapChange,
} from './contract.types.js';

export interface StoredContract {
  contract: RentalContract;
  idempotencyKey: string;
  imageObjectKeys: string[];
}

function buildEvent(event: LifecycleEventInput): ContractEvent {
  return {
    actorId: event.actorId,
    id: randomUUID(),
    metadata: event.metadata ?? {},
    occurredAt: event.occurredAt,
    reason: event.reason ?? null,
    type: event.type,
  };
}

function buildLines(draft: ContractDraft): RentalContract['quote']['lines'] {
  return draft.quote.lines.map((line) => ({
    ...structuredClone(line),
    endAt: draft.quote.endAt,
    id: randomUUID(),
    replacedByLineId: null,
    replacesLineId: null,
    startAt: draft.quote.startAt,
  }));
}

function buildHandover(draft: ContractDraft): RentalContract['handover'] {
  return {
    deliveryPlace: draft.handover.deliveryPlace,
    depositVnd: draft.handover.depositVnd,
    fuelPercent: draft.handover.fuelPercent,
    imageCount: draft.handover.imageObjectKeys.length,
    notes: draft.handover.notes,
    retainedDocument: draft.handover.retainedDocument,
  };
}

function buildContract(draft: ContractDraft): RentalContract {
  const createdAt = new Date().toISOString();
  return {
    activatedAt: null,
    cancellationReason: null,
    cancelledAt: null,
    cancelledById: null,
    code: draft.code,
    completedAt: null,
    createdAt,
    customerId: draft.customerId,
    events: [buildEvent({ actorId: draft.actorId, occurredAt: createdAt, type: 'CREATED' })],
    handover: buildHandover(draft),
    id: randomUUID(),
    overdueSince: null,
    quote: { ...structuredClone(draft.quote), lines: buildLines(draft) },
    status: 'CONFIRMED',
  };
}

function reservationEntries(contract: RentalContract): ReservationEntry[] {
  if (!isOpenContract(contract.status)) return [];
  const state = isRentingContract(contract.status) ? 'RENTED' : 'HELD';
  return contract.quote.lines.map((line) => ({
    endAt: line.endAt,
    startAt: line.startAt,
    state,
    vehicleId: line.vehicleId,
  }));
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
    const contract = this.require(id);
    Object.assign(contract, patch);
    contract.events.push(buildEvent(event));
    this.syncReservations(contract);
    return Promise.resolve(structuredClone(contract));
  }

  extend(id: string, change: ExtensionChange, event: LifecycleEventInput) {
    const contract = this.require(id);
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
    const contract = this.require(id);
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

  findById(id: string): Promise<RentalContract | null> {
    const item = this.contracts.find((stored) => stored.contract.id === id);
    return Promise.resolve(item ? structuredClone(item.contract) : null);
  }

  findByIdempotencyKey(key: string): Promise<RentalContract | null> {
    const item = this.contracts.find((stored) => stored.idempotencyKey === key);
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
          activeLines(item.contract.quote.lines).some((line) => line.vehicleId === vehicleId),
      )
      .map((item) => item.contract.status);
    return Promise.resolve(holdFromStatuses(statuses));
  }

  private require(id: string): RentalContract {
    const item = this.contracts.find((stored) => stored.contract.id === id);
    if (!item) throw new DomainError('NOT_FOUND', 'Không tìm thấy hợp đồng');
    return item.contract;
  }

  private syncReservations(contract: RentalContract) {
    this.reservations.sync(contract.code, reservationEntries(contract));
  }

  private conflictMessage(conflicts: AvailabilityConflict[]): string {
    return `Xe ${conflicts.map((item) => item.vehicleId).join(', ')} vừa có lịch thuê trùng thời gian`;
  }
}
