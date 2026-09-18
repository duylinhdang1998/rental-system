import type { ChargeKind, RentalContract } from '@rental/contracts';
import { earningContracts } from '../economics/fleet-economics.policy.js';

export type RevenueEventKind = 'RENTAL' | 'DELIVERY_FEE' | ChargeKind;

/**
 * One accrual of revenue. Every analytics dimension groups the same events, so the type,
 * vehicle, nationality and month tables reconcile to one total (BR-04).
 */
export interface RevenueEvent {
  at: string;
  contractId: string;
  customerId: string;
  kind: RevenueEventKind;
  rentalDays: number;
  vehicleCode: string | null;
  vehicleId: string | null;
  vnd: number;
}

export interface EventWindow {
  endAt: Date;
  startAt: Date;
}

function lineEvents(contract: RentalContract): RevenueEvent[] {
  return contract.quote.lines.map((line) => ({
    at: line.startAt,
    contractId: contract.id,
    customerId: contract.customerId,
    kind: 'RENTAL',
    rentalDays: line.billableDays,
    vehicleCode: line.vehicleCode,
    vehicleId: line.vehicleId,
    vnd: line.finalSubtotalVnd,
  }));
}

/** Line-level charges belong to the vehicle; contract-level ones stay unallocated. */
function chargeEvents(contract: RentalContract): RevenueEvent[] {
  return contract.charges.map((charge) => {
    const line = contract.quote.lines.find((item) => item.id === charge.lineId);
    return {
      at: charge.createdAt,
      contractId: contract.id,
      customerId: contract.customerId,
      kind: charge.kind,
      rentalDays: 0,
      vehicleCode: line?.vehicleCode ?? null,
      vehicleId: line?.vehicleId ?? null,
      vnd: charge.kind === 'DISCOUNT' ? -charge.amountVnd : charge.amountVnd,
    };
  });
}

function deliveryEvent(contract: RentalContract): RevenueEvent[] {
  if (contract.quote.deliveryFeeVnd <= 0) return [];
  return [
    {
      at: contract.activatedAt ?? contract.createdAt,
      contractId: contract.id,
      customerId: contract.customerId,
      kind: 'DELIVERY_FEE',
      rentalDays: 0,
      vehicleCode: null,
      vehicleId: null,
      vnd: contract.quote.deliveryFeeVnd,
    },
  ];
}

/** Same accrual rule as the fleet economics report: only activated, non-cancelled contracts earn. */
export function revenueEvents(contracts: readonly RentalContract[]): RevenueEvent[] {
  return earningContracts(contracts).flatMap((contract) => [
    ...lineEvents(contract),
    ...chargeEvents(contract),
    ...deliveryEvent(contract),
  ]);
}

export function eventsInWindow(
  events: readonly RevenueEvent[],
  window: EventWindow,
): RevenueEvent[] {
  return events.filter((event) => {
    const at = new Date(event.at);
    return at >= window.startAt && at < window.endAt;
  });
}
