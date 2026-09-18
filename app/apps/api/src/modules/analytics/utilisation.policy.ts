import {
  MILLISECONDS_PER_DAY,
  businessDayKey,
  utilisationPercent,
  type RentalContract,
  type Utilisation,
  type UtilisationRow,
  type Vehicle,
  type VehicleType,
} from '@rental/contracts';
import { earningContracts } from '../economics/fleet-economics.policy.js';
import { dayStart } from '../finance/report-range.js';
import type { EventWindow } from './revenue-events.policy.js';

/** Instants in milliseconds; the end is exclusive. */
export interface OccupiedInterval {
  endAt: number;
  startAt: number;
}

export interface UtilisationInputs {
  intervals: ReadonlyMap<string, OccupiedInterval[]>;
  types: readonly VehicleType[];
  vehicles: readonly Vehicle[];
  window: EventWindow;
}

/** A line occupies its vehicle until the actual return, the swap that replaced it, or its planned end. */
function lineEnd(contract: RentalContract, line: RentalContract['quote']['lines'][number]): string {
  if (line.inspection) return line.inspection.actualReturnAt;
  const replacement = line.replacedByLineId
    ? contract.quote.lines.find((item) => item.id === line.replacedByLineId)
    : undefined;
  return replacement && replacement.startAt < line.endAt ? replacement.startAt : line.endAt;
}

export function occupiedIntervals(
  contracts: readonly RentalContract[],
): Map<string, OccupiedInterval[]> {
  const out = new Map<string, OccupiedInterval[]>();
  for (const contract of earningContracts(contracts)) {
    for (const line of contract.quote.lines) {
      const list = out.get(line.vehicleId) ?? [];
      list.push({ endAt: Date.parse(lineEnd(contract, line)), startAt: Date.parse(line.startAt) });
      out.set(line.vehicleId, list);
    }
  }
  return out;
}

function overlapDays(intervals: readonly OccupiedInterval[], window: EventWindow): number {
  const windowStart = window.startAt.getTime();
  const windowEnd = window.endAt.getTime();
  const overlap = intervals.reduce((sum, interval) => {
    const start = Math.max(interval.startAt, windowStart);
    const end = Math.min(interval.endAt, windowEnd);
    return sum + Math.max(0, end - start);
  }, 0);
  return Math.round(overlap / MILLISECONDS_PER_DAY);
}

/** Days from the later of the window start and the vehicle's creation day to the window end. */
function availableDays(vehicle: Vehicle, window: EventWindow): number {
  const createdStart = dayStart(businessDayKey(vehicle.createdAt)).getTime();
  const from = Math.max(window.startAt.getTime(), createdStart);
  return Math.max(0, Math.round((window.endAt.getTime() - from) / MILLISECONDS_PER_DAY));
}

function row(
  key: string,
  label: string,
  days: { available: number; rented: number },
): UtilisationRow {
  const rentedDays = Math.min(days.rented, days.available);
  return {
    availableDays: days.available,
    key,
    label,
    rentedDays,
    utilisationPercent: utilisationPercent(rentedDays, days.available),
  };
}

function vehicleRows(inputs: UtilisationInputs): { row: UtilisationRow; typeCode: string }[] {
  return [...inputs.vehicles]
    .sort((left, right) => left.code.localeCompare(right.code))
    .map((vehicle) => ({
      row: row(vehicle.id, vehicle.code, {
        available: availableDays(vehicle, inputs.window),
        rented: overlapDays(inputs.intervals.get(vehicle.id) ?? [], inputs.window),
      }),
      typeCode: vehicle.typeCode,
    }));
}

function sumRows(rows: readonly UtilisationRow[]): { available: number; rented: number } {
  return rows.reduce(
    (sum, item) => ({
      available: sum.available + item.availableDays,
      rented: sum.rented + item.rentedDays,
    }),
    { available: 0, rented: 0 },
  );
}

export function buildUtilisation(inputs: UtilisationInputs): Utilisation {
  const vehicles = vehicleRows(inputs);
  const typeNames = new Map(inputs.types.map((type) => [type.code, type.name]));
  const codes = [...new Set(vehicles.map((item) => item.typeCode))].sort();
  const byType = codes.map((code) =>
    row(
      code,
      typeNames.get(code) ?? code,
      sumRows(vehicles.filter((item) => item.typeCode === code).map((item) => item.row)),
    ),
  );
  const byVehicle = vehicles.map((item) => item.row);
  const fleet = row('fleet', 'fleet', sumRows(byVehicle));
  return {
    byType,
    byVehicle,
    fleet: {
      availableDays: fleet.availableDays,
      rentedDays: fleet.rentedDays,
      utilisationPercent: fleet.utilisationPercent,
    },
  };
}
