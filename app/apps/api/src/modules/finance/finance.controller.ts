import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { ReceivableService } from './receivable.service.js';

@Controller('finance')
@UseGuards(AuthenticationGuard)
export class FinanceController {
  constructor(private readonly receivables: ReceivableService) {}

  @Get('receivables')
  receivableList() {
    return this.receivables.list();
  }
}
