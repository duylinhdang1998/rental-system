import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { AvailabilityConflict, AvailabilityInput, RentalContract } from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { ReservationRegistry } from '../../common/reservations/reservation-registry.js';
import type { ContractDraft, ContractRepository } from './contract.types.js';

interface StoredContract {
  contract: RentalContract;
  idempotencyKey: string;
  imageObjectKeys: string[];
}

@Injectable()
export class DemoContractRepository implements ContractRepository {
  private readonly contracts: StoredContract[] = [];

  constructor(private readonly reservations: ReservationRegistry) {}

  createAtomic(draft: ContractDraft): Promise<RentalContract> {
    const existing = this.contracts.find((item) => item.idempotencyKey === draft.idempotencyKey);
    if (existing) return Promise.resolve(structuredClone(existing.contract));
    const conflicts = this.conflictsNow({
      endAt: draft.quote.endAt,
      startAt: draft.quote.startAt,
      vehicleIds: draft.quote.lines.map((line) => line.vehicleId),
    });
    if (conflicts.length) throw new DomainError('CONFLICT', this.conflictMessage(conflicts));
    const contract = this.buildContract(draft);
    this.contracts.push({
      contract,
      idempotencyKey: draft.idempotencyKey,
      imageObjectKeys: [...draft.handover.imageObjectKeys],
    });
    this.reservations.add(
      {
        endAt: draft.quote.endAt,
        startAt: draft.quote.startAt,
        vehicleIds: draft.quote.lines.map((line) => line.vehicleId),
      },
      contract.code,
    );
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

  private buildContract(draft: ContractDraft): RentalContract {
    return {
      code: draft.code,
      createdAt: new Date().toISOString(),
      customerId: draft.customerId,
      handover: {
        deliveryPlace: draft.handover.deliveryPlace,
        depositVnd: draft.handover.depositVnd,
        fuelPercent: draft.handover.fuelPercent,
        imageCount: draft.handover.imageObjectKeys.length,
        notes: draft.handover.notes,
        retainedDocument: draft.handover.retainedDocument,
      },
      id: randomUUID(),
      quote: structuredClone(draft.quote),
      status: 'CONFIRMED',
    };
  }

  private conflictsNow(input: AvailabilityInput): AvailabilityConflict[] {
    return this.reservations.conflicts(input);
  }

  private conflictMessage(conflicts: AvailabilityConflict[]): string {
    return `Xe ${conflicts.map((item) => item.vehicleId).join(', ')} vừa có lịch thuê trùng thời gian`;
  }
}
