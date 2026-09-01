import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import {
  DEFAULT_LATE_RETURN_POLICY,
  type PricingVersion,
  type PublishPricingInput,
} from '@rental/contracts';
import type { PricedCustomer, PricedVehicle, PricingRepository } from './pricing.types.js';

const DEFAULT_TIERS = [
  { dailyRateVnd: 150_000, maxDays: 2, minDays: 1 },
  { dailyRateVnd: 130_000, maxDays: 6, minDays: 3 },
  { dailyRateVnd: 100_000, maxDays: null, minDays: 7 },
];
const VIP_PERCENT = 10;

const VEHICLES: PricedVehicle[] = [
  { code: 'XE-001', id: 'vehicle-001', typeCode: 'SCOOTER' },
  { code: 'XE-002', id: 'vehicle-002', typeCode: 'SCOOTER' },
  { code: 'XE-003', id: 'vehicle-003', typeCode: 'SCOOTER' },
];

@Injectable()
export class DemoPricingRepository implements PricingRepository {
  private readonly versions: PricingVersion[] = [
    {
      createdAt: new Date('2026-09-01T00:00:00.000Z').toISOString(),
      id: 'pricing-scooter-v1',
      lateReturnPolicy: DEFAULT_LATE_RETURN_POLICY,
      tiers: DEFAULT_TIERS,
      typeCode: 'SCOOTER',
      version: 1,
    },
  ];

  customer(customerId: string): Promise<PricedCustomer | null> {
    const names: Record<string, string> = {
      'demo-customer': 'Khách hàng mẫu',
      'demo-risk': 'Risk Fixture',
      'demo-vip': 'Khách VIP mẫu',
    };
    const name = names[customerId];
    return Promise.resolve(
      name ? { adjustmentPercent: customerId === 'demo-vip' ? VIP_PERCENT : 0, name } : null,
    );
  }

  current(typeCode: string): Promise<PricingVersion | null> {
    const candidates = this.versions.filter((item) => item.typeCode === typeCode);
    return Promise.resolve(
      candidates.sort((left, right) => right.version - left.version)[0] ?? null,
    );
  }

  async publish(input: PublishPricingInput): Promise<PricingVersion> {
    const current = await this.current(input.typeCode);
    const version: PricingVersion = {
      ...input,
      createdAt: new Date().toISOString(),
      id: randomUUID(),
      version: (current?.version ?? 0) + 1,
    };
    this.versions.push(version);
    return structuredClone(version);
  }

  vehicles(ids: string[]): Promise<PricedVehicle[]> {
    return Promise.resolve(VEHICLES.filter((vehicle) => ids.includes(vehicle.id)));
  }
}
