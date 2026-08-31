import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import type { DemoDashboard } from '@rental/contracts';
import { DemoDashboardService } from './demo-dashboard.service.js';

@Controller('demo/dashboard')
@UseGuards(AuthenticationGuard)
export class DemoDashboardController {
  constructor(private readonly dashboardService: DemoDashboardService) {}

  @Get()
  getDashboard(): DemoDashboard {
    return this.dashboardService.getDashboard();
  }
}
