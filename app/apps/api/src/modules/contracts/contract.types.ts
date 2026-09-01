import type {
  AvailabilityConflict,
  AvailabilityInput,
  HandoverInput,
  Quote,
  RentalContract,
} from '@rental/contracts';

export interface ContractDraft {
  actorId: string;
  code: string;
  customerId: string;
  handover: HandoverInput;
  idempotencyKey: string;
  quote: Quote;
}

export interface ContractRepository {
  createAtomic(draft: ContractDraft): Promise<RentalContract>;
  findById(id: string): Promise<RentalContract | null>;
  findByIdempotencyKey(key: string): Promise<RentalContract | null>;
  findConflicts(input: AvailabilityInput): Promise<AvailabilityConflict[]>;
  imageObjectKeys(id: string): Promise<string[]>;
}
