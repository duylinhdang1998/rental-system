import { Inject, Injectable } from '@nestjs/common';
import type {
  AuthenticatedUser,
  PricingVersion,
  PublishPricingInput,
  Quote,
  QuoteInput,
  QuoteLine,
} from '@rental/contracts';
import { AuditService } from '../../common/audit/audit.service.js';
import { DomainError } from '../../common/errors/domain.error.js';
import { PRICING_REPOSITORY } from './pricing.tokens.js';
import type { PricedVehicle, PricingRepository } from './pricing.types.js';
import {
  applyPercentAdjustment,
  billableRentalDays,
  calculateTierPrice,
  validatePricingTiers,
} from './pricing.policy.js';

interface LineContext {
  actor: AuthenticatedUser;
  adjustment: number;
  days: number;
  input: QuoteInput;
  vehicle: PricedVehicle;
}

interface OverrideAudit {
  actorId: string;
  after: number;
  before: number;
  reason: string;
  vehicleId: string;
}

@Injectable()
export class PricingService {
  constructor(
    @Inject(PRICING_REPOSITORY) private readonly repository: PricingRepository,
    private readonly audit: AuditService,
  ) {}

  current(typeCode: string) {
    return this.requireVersion(typeCode);
  }

  async publish(input: PublishPricingInput, actor: AuthenticatedUser) {
    if (!validatePricingTiers(input.tiers)) {
      throw new DomainError('INVALID_INPUT', 'Các bậc giá phải liên tục từ ngày đầu tiên');
    }
    const version = await this.repository.publish(input, actor.id);
    await this.audit.record({
      action: 'PRICING_PUBLISHED',
      actorId: actor.id,
      entityId: version.id,
      entityType: 'PricingVersion',
    });
    return version;
  }

  async quote(input: QuoteInput, actor: AuthenticatedUser): Promise<Quote> {
    const billableDays = this.days(input.startAt, input.endAt);
    const vehicleIds = [...new Set(input.vehicleIds)];
    const vehicles = await this.repository.vehicles(vehicleIds);
    if (vehicles.length !== vehicleIds.length)
      throw new DomainError('NOT_FOUND', 'Không tìm thấy xe đã chọn');
    if (input.overrides.length && actor.role !== 'OWNER') {
      throw new DomainError('FORBIDDEN', 'Chỉ Chủ cửa hàng được sửa giá');
    }
    const customer = await this.repository.customer(input.customerId);
    if (!customer) throw new DomainError('NOT_FOUND', 'Không tìm thấy khách hàng');
    const adjustment = customer.adjustmentPercent;
    const lines = await Promise.all(
      vehicles.map((vehicle) =>
        this.line({ actor, adjustment, days: billableDays, input, vehicle }),
      ),
    );
    return {
      deliveryFeeVnd: input.deliveryFeeVnd,
      customerName: customer.name,
      endAt: input.endAt,
      lines,
      startAt: input.startAt,
      totalVnd: lines.reduce((sum, line) => sum + line.finalSubtotalVnd, input.deliveryFeeVnd),
    };
  }

  private days(startAt: string, endAt: string): number {
    try {
      return billableRentalDays(startAt, endAt);
    } catch {
      throw new DomainError('INVALID_INPUT', 'Giờ trả xe phải sau giờ nhận xe');
    }
  }

  private async line(context: LineContext): Promise<QuoteLine> {
    const { actor, adjustment, days, input, vehicle } = context;
    const pricing = await this.requireVersion(vehicle.typeCode);
    const calculated = calculateTierPrice(days, pricing.tiers);
    const adjusted = applyPercentAdjustment(calculated.subtotalVnd, adjustment);
    const override = input.overrides.find((item) => item.vehicleId === vehicle.id);
    if (override)
      await this.auditOverride({
        actorId: actor.id,
        after: override.amountVnd,
        before: adjusted,
        reason: override.reason,
        vehicleId: vehicle.id,
      });
    return {
      adjustmentPercent: adjustment,
      baseSubtotalVnd: calculated.subtotalVnd,
      billableDays: days,
      dailyRateVnd: calculated.dailyRateVnd,
      explanation: this.explanation(days, calculated.dailyRateVnd, pricing, adjustment),
      finalSubtotalVnd: override?.amountVnd ?? adjusted,
      ...(override ? { overrideReason: override.reason } : {}),
      pricingVersionId: pricing.id,
      pricingVersionNumber: pricing.version,
      vehicleCode: vehicle.code,
      vehicleId: vehicle.id,
    };
  }

  private explanation(
    days: number,
    rate: number,
    pricing: PricingVersion,
    adjustment: number,
  ): string {
    const adjusted = adjustment ? ` · VIP -${adjustment}%` : '';
    return `${days} ngày × ${rate.toLocaleString('vi-VN')} ₫ · bảng giá v${pricing.version}${adjusted}`;
  }

  private async requireVersion(typeCode: string): Promise<PricingVersion> {
    const version = await this.repository.current(typeCode);
    if (!version) throw new DomainError('NOT_FOUND', 'Chưa cấu hình bảng giá cho loại xe');
    return version;
  }

  private auditOverride(input: OverrideAudit) {
    return this.audit.record({
      action: 'PRICE_OVERRIDDEN',
      actorId: input.actorId,
      entityId: input.vehicleId,
      entityType: 'VehicleQuote',
      metadata: { after: input.after, before: input.before, reason: input.reason },
    });
  }
}
