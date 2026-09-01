import { Injectable } from '@nestjs/common';
import type { PricingVersion, PublishPricingInput } from '@rental/contracts';
import { PrismaService } from '../../database/prisma.service.js';
import type { PricingRepository } from './pricing.types.js';

const VIP_PERCENT = 10;

function mapVersion(item: {
  createdAt: Date;
  id: string;
  lateReturnGraceMinutes: number;
  lateReturnHourlyRateVnd: number;
  tiers: PricingVersion['tiers'];
  typeCode: string;
  version: number;
}): PricingVersion {
  return {
    createdAt: item.createdAt.toISOString(),
    id: item.id,
    lateReturnPolicy: {
      graceMinutes: item.lateReturnGraceMinutes,
      hourlyRateVnd: item.lateReturnHourlyRateVnd,
    },
    tiers: item.tiers,
    typeCode: item.typeCode,
    version: item.version,
  };
}

@Injectable()
export class PrismaPricingRepository implements PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async customer(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      include: { tags: true },
      where: { id: customerId },
    });
    if (!customer) return null;
    return {
      adjustmentPercent: customer.tags.some((tag) => tag.code === 'VIP') ? VIP_PERCENT : 0,
      name: customer.name,
    };
  }

  async current(typeCode: string): Promise<PricingVersion | null> {
    const item = await this.prisma.pricingVersion.findFirst({
      include: { tiers: { orderBy: { minDays: 'asc' } } },
      orderBy: { version: 'desc' },
      where: { typeCode },
    });
    return item ? mapVersion(item) : null;
  }

  async publish(input: PublishPricingInput, actorId: string): Promise<PricingVersion> {
    return this.prisma.$transaction(async (transaction) => {
      const latest = await transaction.pricingVersion.findFirst({
        orderBy: { version: 'desc' },
        where: { typeCode: input.typeCode },
      });
      const created = await transaction.pricingVersion.create({
        data: {
          createdById: actorId,
          lateReturnGraceMinutes: input.lateReturnPolicy.graceMinutes,
          lateReturnHourlyRateVnd: input.lateReturnPolicy.hourlyRateVnd,
          tiers: { create: input.tiers },
          typeCode: input.typeCode,
          version: (latest?.version ?? 0) + 1,
        },
        include: { tiers: { orderBy: { minDays: 'asc' } } },
      });
      return mapVersion(created);
    });
  }

  async vehicles(ids: string[]) {
    return this.prisma.vehicle
      .findMany({
        select: { code: true, id: true, type: { select: { code: true } } },
        where: { id: { in: ids } },
      })
      .then((items) =>
        items.map((item) => ({ code: item.code, id: item.id, typeCode: item.type.code })),
      );
  }
}
