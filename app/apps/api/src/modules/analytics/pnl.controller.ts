import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { pnlQuerySchema, type PnlQuery } from '@rental/contracts';
import type { Response } from 'express';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { ThrottlePolicy } from '../../common/throttle/throttle.decorator.js';
import { PnlExportService, pnlExportFileName } from './pnl-export.service.js';
import { PnlService } from './pnl.service.js';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** BR-08: profit figures are Owner-only; the guard runs before any query executes. */
@Controller('reports')
@UseGuards(AuthenticationGuard, OwnerAuthorizationGuard)
export class PnlController {
  constructor(
    private readonly reports: PnlService,
    private readonly exports: PnlExportService,
  ) {}

  @Get('pnl')
  report(@Query(new ZodValidationPipe(pnlQuerySchema)) query: PnlQuery) {
    return this.reports.report(query);
  }

  @Get('pnl/export')
  @ThrottlePolicy('export')
  async exportReport(
    @Query(new ZodValidationPipe(pnlQuerySchema)) query: PnlQuery,
    @Res() response: Response,
  ) {
    const report = await this.reports.report(query);
    response.setHeader('content-type', XLSX_CONTENT_TYPE);
    response.setHeader(
      'content-disposition',
      `attachment; filename="${pnlExportFileName(report)}"`,
    );
    response.send(this.exports.workbook(report));
  }
}
