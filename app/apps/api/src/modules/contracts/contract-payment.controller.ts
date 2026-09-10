import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { contractPaymentInputSchema, type ContractPaymentInput } from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { ContractPaymentService } from './contract-payment.service.js';

/** Append-only ledger: there is deliberately no PUT/PATCH/DELETE here (BR-07). */
@Controller('contracts')
@UseGuards(AuthenticationGuard)
export class ContractPaymentController {
  constructor(private readonly payments: ContractPaymentService) {}

  @Get(':id/ledger')
  ledger(@Param('id') id: string) {
    return this.payments.ledger(id);
  }

  @Post(':id/payments')
  @UseGuards(CsrfGuard)
  record(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(contractPaymentInputSchema)) input: ContractPaymentInput,
    @Req() request: ContextRequest,
  ) {
    return this.payments.record(id, input, request.authenticatedUser!);
  }
}
