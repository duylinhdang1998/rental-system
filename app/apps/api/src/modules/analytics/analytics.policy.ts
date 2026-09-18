import {
  UNALLOCATED_KEY,
  businessDayKey,
  monthKey,
  sharePercent,
  type AnalyticsTotals,
  type ChargeKind,
  type DimensionRow,
  type MonthRow,
  type SurchargeRow,
  type Vehicle,
} from '@rental/contracts';
import type { RevenueEvent } from './revenue-events.policy.js';

export interface DimensionKey {
  key: string;
  label: string;
}

export type Classifier = (event: RevenueEvent) => DimensionKey;

interface Bucket extends DimensionKey {
  contracts: Set<string>;
  rentalDays: number;
  vnd: number;
}

export const UNALLOCATED_LABEL = 'Chưa phân bổ';
export const UNKNOWN_NATIONALITY = 'Không rõ';
export const SURCHARGE_KINDS: readonly ChargeKind[] = [
  'LATE_RETURN',
  'DAMAGE',
  'OTHER',
  'DISCOUNT',
];

const UNALLOCATED: DimensionKey = { key: UNALLOCATED_KEY, label: UNALLOCATED_LABEL };

function accumulate(buckets: Map<string, Bucket>, at: DimensionKey, event: RevenueEvent): void {
  const bucket = buckets.get(at.key) ?? {
    ...at,
    contracts: new Set<string>(),
    rentalDays: 0,
    vnd: 0,
  };
  bucket.contracts.add(event.contractId);
  bucket.rentalDays += event.rentalDays;
  bucket.vnd += event.vnd;
  buckets.set(at.key, bucket);
}

/** Highest revenue first; the unallocated bucket always closes the table. */
function sortRows(rows: DimensionRow[]): DimensionRow[] {
  return rows.sort((left, right) => {
    if ((left.key === UNALLOCATED_KEY) !== (right.key === UNALLOCATED_KEY)) {
      return left.key === UNALLOCATED_KEY ? 1 : -1;
    }
    return right.revenueVnd - left.revenueVnd || left.label.localeCompare(right.label);
  });
}

export function dimensionRows(
  events: readonly RevenueEvent[],
  classify: Classifier,
  totalVnd: number,
): DimensionRow[] {
  const buckets = new Map<string, Bucket>();
  for (const event of events) accumulate(buckets, classify(event), event);
  return sortRows(
    [...buckets.values()].map((bucket) => ({
      contractCount: bucket.contracts.size,
      key: bucket.key,
      label: bucket.label,
      rentalDays: bucket.rentalDays,
      revenueVnd: bucket.vnd,
      sharePercent: sharePercent(bucket.vnd, totalVnd),
    })),
  );
}

export function vehicleDimension(vehiclesById: ReadonlyMap<string, Vehicle>): Classifier {
  return (event) => {
    if (!event.vehicleId) return UNALLOCATED;
    const vehicle = vehiclesById.get(event.vehicleId);
    return { key: event.vehicleId, label: vehicle?.code ?? event.vehicleCode ?? event.vehicleId };
  };
}

export function typeDimension(
  vehiclesById: ReadonlyMap<string, Vehicle>,
  typeNames: ReadonlyMap<string, string>,
): Classifier {
  return (event) => {
    const vehicle = event.vehicleId ? vehiclesById.get(event.vehicleId) : undefined;
    if (!vehicle) return UNALLOCATED;
    return { key: vehicle.typeCode, label: typeNames.get(vehicle.typeCode) ?? vehicle.typeCode };
  };
}

/** Delivery fees and contract-level charges do have a customer, so nothing is unallocated here. */
export function nationalityDimension(nationalities: ReadonlyMap<string, string>): Classifier {
  return (event) => {
    const nationality = nationalities.get(event.customerId);
    return nationality
      ? { key: nationality, label: nationality }
      : { key: 'UNKNOWN', label: UNKNOWN_NATIONALITY };
  };
}

export function monthRows(events: readonly RevenueEvent[]): MonthRow[] {
  const buckets = new Map<string, Bucket>();
  for (const event of events) {
    const month = monthKey(businessDayKey(event.at));
    accumulate(buckets, { key: month, label: month }, event);
  }
  return [...buckets.values()]
    .sort((left, right) => left.key.localeCompare(right.key))
    .map((bucket) => ({
      contractCount: bucket.contracts.size,
      month: bucket.key,
      rentalDays: bucket.rentalDays,
      revenueVnd: bucket.vnd,
    }));
}

function isSurcharge(event: RevenueEvent): event is RevenueEvent & { kind: ChargeKind } {
  return event.kind !== 'RENTAL' && event.kind !== 'DELIVERY_FEE';
}

/** Every kind is listed (zero rows included) so the table and the workbook keep a fixed shape. */
export function surchargeRows(events: readonly RevenueEvent[]): SurchargeRow[] {
  return SURCHARGE_KINDS.map((kind) => {
    const matching = events.filter((event) => isSurcharge(event) && event.kind === kind);
    return {
      amountVnd: matching.reduce((sum, event) => sum + Math.abs(event.vnd), 0),
      count: matching.length,
      kind,
    };
  });
}

export function analyticsTotals(events: readonly RevenueEvent[]): AnalyticsTotals {
  const totals = {
    contracts: new Set<string>(),
    rentalDays: 0,
    surcharges: 0,
    unallocated: 0,
    vnd: 0,
  };
  for (const event of events) {
    totals.contracts.add(event.contractId);
    totals.rentalDays += event.rentalDays;
    totals.vnd += event.vnd;
    if (isSurcharge(event)) totals.surcharges += event.vnd;
    if (!event.vehicleId) totals.unallocated += event.vnd;
  }
  return {
    contractCount: totals.contracts.size,
    rentalDays: totals.rentalDays,
    revenueVnd: totals.vnd,
    surchargeNetVnd: totals.surcharges,
    unallocatedVnd: totals.unallocated,
  };
}
