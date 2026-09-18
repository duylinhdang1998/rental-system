import { type DynamicModule, Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsExportService } from './analytics-export.service.js';
import { AnalyticsService } from './analytics.service.js';
import { PnlController } from './pnl.controller.js';
import { PnlExportService } from './pnl-export.service.js';
import { PnlService } from './pnl.service.js';

/**
 * Sprint 13 read-only analytics. It imports the *same* contract, customer and economics module
 * instances the application registered (the fleet module is global), so every figure is read
 * from the ledgers that already exist and nothing is stored twice (BR-07 / BR-09).
 */
@Module({})
export class AnalyticsModule {
  static register(
    contracts: DynamicModule,
    customers: DynamicModule,
    economics: DynamicModule,
  ): DynamicModule {
    return {
      controllers: [AnalyticsController, PnlController],
      imports: [contracts, customers, economics],
      module: AnalyticsModule,
      providers: [AnalyticsService, AnalyticsExportService, PnlService, PnlExportService],
    };
  }
}
