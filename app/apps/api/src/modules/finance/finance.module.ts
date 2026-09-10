import { type DynamicModule, Module } from '@nestjs/common';
import { FinanceController } from './finance.controller.js';
import { ReceivableService } from './receivable.service.js';
import { ReportController } from './report.controller.js';
import { RevenueExportService } from './revenue-export.service.js';
import { RevenueReportService } from './revenue-report.service.js';

/**
 * Read-only finance module. It imports the *same* contract and customer module instances the
 * application registered, so demo repositories are shared rather than duplicated.
 */
@Module({})
export class FinanceModule {
  static register(contracts: DynamicModule, customers: DynamicModule): DynamicModule {
    return {
      controllers: [FinanceController, ReportController],
      imports: [contracts, customers],
      module: FinanceModule,
      providers: [ReceivableService, RevenueReportService, RevenueExportService],
    };
  }
}
