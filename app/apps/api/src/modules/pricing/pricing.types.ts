import type { PricingVersion, PublishPricingInput } from '@rental/contracts';

export interface PricedVehicle {
  code: string;
  id: string;
  typeCode: string;
}

export interface PricedCustomer {
  adjustmentPercent: number;
  name: string;
}

export interface PricingRepository {
  customer(customerId: string): Promise<PricedCustomer | null>;
  current(typeCode: string): Promise<PricingVersion | null>;
  publish(input: PublishPricingInput, actorId: string): Promise<PricingVersion>;
  vehicles(ids: string[]): Promise<PricedVehicle[]>;
}
