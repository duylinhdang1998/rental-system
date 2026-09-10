import {
  settlementFigures,
  type ContractStatus,
  type RentalContract,
  type SettlementFigures,
  type SettlementItem,
  type SettlementStatement,
} from '@rental/contracts';
import { activeLines, openLines } from './contract-lifecycle.policy.js';

/** Money math is shared with the admin preview; see `@rental/contracts` settlement.ts. */
export { maxDepositApplied, settlementFigures } from '@rental/contracts';

/** Charges may be appended while renting or after return, until the settlement freezes the figures. */
export const CHARGEABLE_CONTRACT_STATUSES: readonly ContractStatus[] = [
  'ACTIVE',
  'OVERDUE',
  'COMPLETED',
];

export function chargeAllowed(contract: Pick<RentalContract, 'settledAt' | 'status'>): boolean {
  return contract.settledAt === null && CHARGEABLE_CONTRACT_STATUSES.includes(contract.status);
}

/** Rental lines (swap chains resolved), delivery fee and every recorded charge, in that order. */
export function statementItems(contract: RentalContract): SettlementItem[] {
  const rentals: SettlementItem[] = activeLines(contract.quote.lines).map((line) => ({
    amountVnd: line.finalSubtotalVnd,
    description: line.explanation,
    id: `rental:${line.id}`,
    kind: 'RENTAL',
    vehicleCode: line.vehicleCode,
  }));
  const delivery: SettlementItem[] = contract.quote.deliveryFeeVnd
    ? [
        {
          amountVnd: contract.quote.deliveryFeeVnd,
          description: 'Phí giao xe',
          id: 'delivery-fee',
          kind: 'DELIVERY_FEE',
          vehicleCode: null,
        },
      ]
    : [];
  const charges: SettlementItem[] = contract.charges.map((charge) => ({
    amountVnd: charge.amountVnd,
    description: charge.description,
    id: charge.id,
    kind: charge.kind,
    vehicleCode: charge.vehicleCode,
  }));
  return [...rentals, ...delivery, ...charges];
}

export function sumItems(items: readonly SettlementItem[], discounts: boolean): number {
  return items
    .filter((item) => (item.kind === 'DISCOUNT') === discounts)
    .reduce((sum, item) => sum + item.amountVnd, 0);
}

function frozenFigures(settlement: NonNullable<RentalContract['settlement']>): SettlementFigures {
  return {
    chargesVnd: settlement.chargesVnd,
    depositAppliedVnd: settlement.depositAppliedVnd,
    depositVnd: settlement.depositVnd,
    discountsVnd: settlement.discountsVnd,
    outstandingVnd: settlement.outstandingVnd,
    paidVnd: settlement.paidVnd,
    receivableVnd: settlement.receivableVnd,
    refundVnd: settlement.refundVnd,
    totalDueVnd: settlement.totalDueVnd,
  };
}

export interface StatementOptions {
  depositAppliedVnd?: number | undefined;
  paidVnd: number;
}

/** Live preview before settlement; the frozen snapshot afterwards (BR-07). */
export function buildStatement(
  contract: RentalContract,
  options: StatementOptions,
): SettlementStatement {
  const items = statementItems(contract);
  const figures = contract.settlement
    ? frozenFigures(contract.settlement)
    : settlementFigures({
        chargesVnd: sumItems(items, false),
        depositAppliedVnd: options.depositAppliedVnd,
        depositVnd: contract.handover.depositVnd,
        discountsVnd: sumItems(items, true),
        paidVnd: options.paidVnd,
      });
  return {
    ...figures,
    contractId: contract.id,
    items,
    openVehicleCodes: openLines(contract.quote.lines).map((line) => line.vehicleCode),
    ready: contract.status === 'COMPLETED' && contract.settledAt === null,
    settledAt: contract.settledAt,
  };
}
