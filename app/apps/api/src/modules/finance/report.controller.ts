import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { reportRangeSchema, type ReportRange } from '@rental/contracts';
import type { Response } from 'express';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { ThrottlePolicy } from '../../common/throttle/throttle.decorator.js';
import { RevenueExportService, exportFileName } from './revenue-export.service.js';
import { RevenueReportService } from './revenue-report.service.js';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** BR-08: revenue aggregates are Owner-only; the guard runs before any query executes. */
@Controller('reports')
@UseGuards(AuthenticationGuard, OwnerAuthorizationGuard)
export class ReportController {
  constructor(
    private readonly reports: RevenueReportService,
    private readonly exports: RevenueExportService,
  ) {}

  @Get('revenue')
  revenue(@Query(new ZodValidationPipe(reportRangeSchema)) range: ReportRange) {
    return this.reports.revenue(range);
  }

  @Get('revenue/export')
  @ThrottlePolicy('export')
  async exportRevenue(
    @Query(new ZodValidationPipe(reportRangeSchema)) range: ReportRange,
    @Res() response: Response,
  ) {
    const report = await this.reports.revenue(range);
    response.setHeader('content-type', XLSX_CONTENT_TYPE);
    response.setHeader('content-disposition', `attachment; filename="${exportFileName(report)}"`);
    response.send(this.exports.workbook(report));
  }
}
