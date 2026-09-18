import { Inject, Injectable } from '@nestjs/common';
import type { AnalyticsReport, ReportRange, Vehicle, VehicleType } from '@rental/contracts';
import { CONTRACT_REPOSITORY } from '../contracts/contract.tokens.js';
import type { ContractRepository } from '../contracts/contract.types.js';
import { CUSTOMER_REPOSITORY } from '../customers/customer.tokens.js';
import type { CustomerRepository } from '../customers/customer.types.js';
import { FLEET_REPOSITORY } from '../fleet/fleet.tokens.js';
import type { FleetRepository } from '../fleet/fleet.types.js';
import { analyticsWindow } from './analytics-window.js';
import {
  analyticsTotals,
  dimensionRows,
  monthRows,
  nationalityDimension,
  surchargeRows,
  typeDimension,
  vehicleDimension,
} from './analytics.policy.js';
import { eventsInWindow, revenueEvents, type RevenueEvent } from './revenue-events.policy.js';
import { buildUtilisation, occupiedIntervals } from './utilisation.policy.js';

interface BreakdownInput {
  events: readonly RevenueEvent[];
  nationalities: Map<string, string>;
  totalVnd: number;
  types: readonly VehicleType[];
  vehicles: readonly Vehicle[];
}

type Breakdowns = Pick<AnalyticsReport, 'byNationality' | 'byType' | 'byVehicle'>;

/** The three dimension tables share one event list and one total, so they reconcile (BR-04). */
function breakdowns({
  events,
  nationalities,
  totalVnd,
  types,
  vehicles,
}: BreakdownInput): Breakdowns {
  const vehiclesById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
  const typeNames = new Map(types.map((type) => [type.code, type.name]));
  return {
    byNationality: dimensionRows(events, nationalityDimension(nationalities), totalVnd),
    byType: dimensionRows(events, typeDimension(vehiclesById, typeNames), totalVnd),
    byVehicle: dimensionRows(events, vehicleDimension(vehiclesById), totalVnd),
  };
}

/** US-029 / BR-08: revenue by type, vehicle, nationality and month, surcharges and utilisation (Owner only). */
@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contracts: ContractRepository,
    @Inject(FLEET_REPOSITORY) private readonly fleet: FleetRepository,
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
  ) {}

  async report(range: ReportRange, now = new Date()): Promise<AnalyticsReport> {
    const window = analyticsWindow(range);
    const [contracts, vehicles, types] = await Promise.all([
      this.contracts.listFinancial(),
      this.fleet.listVehicles({}),
      this.fleet.listTypes(),
    ]);
    const events = eventsInWindow(revenueEvents(contracts), window);
    const nationalities = await this.nationalities(events);
    const totals = analyticsTotals(events);
    return {
      ...breakdowns({ events, nationalities, totalVnd: totals.revenueVnd, types, vehicles }),
      byMonth: monthRows(events),
      from: window.from,
      generatedAt: now.toISOString(),
      surcharges: surchargeRows(events),
      timeZone: window.timeZone,
      to: window.to,
      totals,
      utilisation: buildUtilisation({
        intervals: occupiedIntervals(contracts),
        types,
        vehicles,
        window,
      }),
    };
  }

  /** Nationality per customer that earned inside the window; missing customers stay unknown. */
  private async nationalities(events: readonly RevenueEvent[]): Promise<Map<string, string>> {
    const ids = [...new Set(events.map((event) => event.customerId))];
    const customers = await Promise.all(ids.map((id) => this.customers.findById(id)));
    return new Map(
      customers.flatMap((customer) =>
        customer ? [[customer.id, customer.nationality] satisfies [string, string]] : [],
      ),
    );
  }
}
