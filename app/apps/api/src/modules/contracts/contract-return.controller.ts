import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  contractChargeInputSchema,
  contractReturnInputSchema,
  contractSettleInputSchema,
  type ContractChargeInput,
  type ContractReturnInput,
  type ContractSettleInput,
} from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { ContractReturnService } from './contract-return.service.js';
import { ContractSettlementService } from './contract-settlement.service.js';

@Controller('contracts')
@UseGuards(AuthenticationGuard)
export class ContractReturnController {
  constructor(
    private readonly returns: ContractReturnService,
    private readonly settlements: ContractSettlementService,
  ) {}

  /** Two static segments, so it never collides with `GET :id`. */
  @Get('returns/queue')
  queue() {
    return this.returns.queue();
  }

  @Get(':id/settlement')
  statement(@Param('id') id: string) {
    return this.settlements.statement(id);
  }

  @Post(':id/lines/:lineId/return')
  @UseGuards(CsrfGuard)
  returnVehicle(
    @Param('id') id: string,
    @Param('lineId') lineId: string,
    @Body(new ZodValidationPipe(contractReturnInputSchema)) input: ContractReturnInput,
    @Req() request: ContextRequest,
  ) {
    return this.returns.returnVehicle(id, lineId, input, request.authenticatedUser!);
  }

  @Post(':id/charges')
  @UseGuards(CsrfGuard)
  addCharge(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(contractChargeInputSchema)) input: ContractChargeInput,
    @Req() request: ContextRequest,
  ) {
    return this.settlements.addCharge(id, input, request.authenticatedUser!);
  }

  @Post(':id/settle')
  @UseGuards(CsrfGuard)
  settle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(contractSettleInputSchema)) input: ContractSettleInput,
    @Req() request: ContextRequest,
  ) {
    return this.settlements.settle(id, input, request.authenticatedUser!);
  }
}
