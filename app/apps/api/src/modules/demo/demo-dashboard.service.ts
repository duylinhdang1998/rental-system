import { Injectable } from '@nestjs/common';
import type { DemoDashboard } from '@rental/contracts';

@Injectable()
export class DemoDashboardService {
  getDashboard(): DemoDashboard {
    return {
      activeRentals: 12,
      availableVehicles: 18,
      dueToday: 5,
      overdue: 2,
      revenueMonth: 124_000_000,
    };
  }
}
