import {
  pricingVersionSchema,
  type PricingVersion,
  type PublishPricingInput,
} from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export async function fetchCurrentPricing(): Promise<PricingVersion> {
  return pricingVersionSchema.parse(await apiRequest('/api/pricing/current?typeCode=SCOOTER'));
}

export async function publishPricing(input: PublishPricingInput): Promise<PricingVersion> {
  return pricingVersionSchema.parse(
    await apiRequest('/api/pricing/versions', {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  );
}
