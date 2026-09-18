import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { fleetEconomicsQuerySchema, type FleetEconomicsQuery } from '@rental/contracts';
import type { Response } from 'express';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { ThrottlePolicy } from '../../common/throttle/throttle.decorator.js';
import {
  FleetEconomicsExportService,
  economicsExportFileName,
} from './fleet-economics-export.service.js';
import { FleetEconomicsService } from './fleet-economics.service.js';

const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

/** BR-08: cost and margin figures are Owner-only; the guard runs before any query executes. */
@Controller('reports')
@UseGuards(AuthenticationGuard, OwnerAuthorizationGuard)
export class FleetEconomicsController {
  constructor(
    private readonly reports: FleetEconomicsService,
    private readonly exports: FleetEconomicsExportService,
  ) {}

  @Get('fleet-economics')
  report(@Query(new ZodValidationPipe(fleetEconomicsQuerySchema)) query: FleetEconomicsQuery) {
    return this.reports.report(query);
  }

  @Get('fleet-economics/export')
  @ThrottlePolicy('export')
  async exportReport(
    @Query(new ZodValidationPipe(fleetEconomicsQuerySchema)) query: FleetEconomicsQuery,
    @Res() response: Response,
  ) {
    const report = await this.reports.report(query);
    response.setHeader('content-type', XLSX_CONTENT_TYPE);
    response.setHeader(
      'content-disposition',
      `attachment; filename="${economicsExportFileName(report)}"`,
    );
    response.send(this.exports.workbook(report));
  }
}
