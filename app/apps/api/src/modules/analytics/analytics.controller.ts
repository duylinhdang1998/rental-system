import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { reportRangeSchema, type ReportRange } from '@rental/contracts';
import type { Response } from 'express';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { ThrottlePolicy } from '../../common/throttle/throttle.decorator.js';
import { AnalyticsExportService, analyticsExportFileName } from './analytics-export.service.js';
import { AnalyticsService } from './analytics.service.js';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** BR-08: multi-dimensional revenue is Owner-only; the guard runs before any query executes. */
@Controller('reports')
@UseGuards(AuthenticationGuard, OwnerAuthorizationGuard)
export class AnalyticsController {
  constructor(
    private readonly reports: AnalyticsService,
    private readonly exports: AnalyticsExportService,
  ) {}

  @Get('analytics')
  report(@Query(new ZodValidationPipe(reportRangeSchema)) range: ReportRange) {
    return this.reports.report(range);
  }

  @Get('analytics/export')
  @ThrottlePolicy('export')
  async exportReport(
    @Query(new ZodValidationPipe(reportRangeSchema)) range: ReportRange,
    @Res() response: Response,
  ) {
    const report = await this.reports.report(range);
    response.setHeader('content-type', XLSX_CONTENT_TYPE);
    response.setHeader(
      'content-disposition',
      `attachment; filename="${analyticsExportFileName(report)}"`,
    );
    response.send(this.exports.workbook(report));
  }
}
