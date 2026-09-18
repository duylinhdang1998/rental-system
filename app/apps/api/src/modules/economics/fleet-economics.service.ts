import { Inject, Injectable } from '@nestjs/common';
import {
  BUSINESS_TIME_ZONE,
  MILLISECONDS_PER_DAY,
  TRAILING_WINDOW_DAYS,
  businessDayKey,
  type FleetEconomicsQuery,
  type FleetEconomicsReport,
  type FleetEconomicsRow,
  type Vehicle,
  type VehicleAcquisition,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { CONTRACT_REPOSITORY } from '../contracts/contract.tokens.js';
import type { ContractRepository } from '../contracts/contract.types.js';
import { dayStart } from '../finance/report-range.js';
import { FLEET_REPOSITORY } from '../fleet/fleet.tokens.js';
import type { FleetRepository } from '../fleet/fleet.types.js';
import { ECONOMICS_REPOSITORY } from './economics.tokens.js';
import type { EconomicsRepository } from './economics.types.js';
import {
  attributeExpenses,
  attributeRevenue,
  economicsRow,
  economicsTotals,
  type AttributedExpenses,
  type AttributedRevenue,
  type EconomicsWindow,
} from './fleet-economics.policy.js';

export function economicsWindow(asOf: string): EconomicsWindow {
  const start = dayStart(asOf);
  if (Number.isNaN(start.getTime())) {
    throw new DomainError('INVALID_INPUT', 'Ngày tính không hợp lệ');
  }
  const endAt = new Date(start.getTime() + MILLISECONDS_PER_DAY);
  return {
    asOf,
    endAt,
    trailingStartAt: new Date(endAt.getTime() - TRAILING_WINDOW_DAYS * MILLISECONDS_PER_DAY),
  };
}

interface Ledgers {
  acquisitions: VehicleAcquisition[];
  revenue: AttributedRevenue;
  spent: AttributedExpenses;
}

function fleetRows(vehicles: Vehicle[], ledgers: Ledgers, asOf: string): FleetEconomicsRow[] {
  const byVehicle = new Map(ledgers.acquisitions.map((item) => [item.vehicleId, item]));
  return vehicles.map((vehicle) =>
    economicsRow(
      {
        acquisition: byVehicle.get(vehicle.id) ?? null,
        expenses: ledgers.spent.byVehicle.get(vehicle.id),
        revenue: ledgers.revenue.byVehicle.get(vehicle.id),
        vehicle,
      },
      asOf,
    ),
  );
}

/** US-025 / BR-08: per-vehicle cost, revenue, expenses, depreciation and break-even (Owner only). */
@Injectable()
export class FleetEconomicsService {
  constructor(
    @Inject(ECONOMICS_REPOSITORY) private readonly repository: EconomicsRepository,
    @Inject(FLEET_REPOSITORY) private readonly fleet: FleetRepository,
    @Inject(CONTRACT_REPOSITORY) private readonly contracts: ContractRepository,
  ) {}

  async report(query: FleetEconomicsQuery, now = new Date()): Promise<FleetEconomicsReport> {
    const window = economicsWindow(query.asOf ?? businessDayKey(now));
    const [vehicles, acquisitions, contracts, expenses] = await Promise.all([
      this.fleet.listVehicles({}),
      this.repository.listAcquisitions(),
      this.contracts.listFinancial(),
      this.repository.listExpenses({ to: window.asOf }),
    ]);
    const revenue = attributeRevenue(contracts, window);
    const spent = attributeExpenses(expenses, window);
    const rows = fleetRows(vehicles, { acquisitions, revenue, spent }, window.asOf);
    return {
      asOf: window.asOf,
      generatedAt: now.toISOString(),
      rows,
      timeZone: BUSINESS_TIME_ZONE,
      totals: economicsTotals(rows, {
        expensesVnd: spent.unallocated.vnd,
        revenueVnd: revenue.unallocated.vnd,
      }),
    };
  }
}
