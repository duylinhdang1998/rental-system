import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  expenseInputSchema,
  expenseListQuerySchema,
  expenseReversalInputSchema,
  type ExpenseInput,
  type ExpenseListQuery,
  type ExpenseReversalInput,
} from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { ExpenseService } from './expense.service.js';

/** No PATCH or DELETE exists on purpose: rows are immutable and corrections are reversals (BR-09). */
@Controller('expenses')
@UseGuards(AuthenticationGuard)
export class ExpenseController {
  constructor(private readonly service: ExpenseService) {}

  @Get()
  list(@Query(new ZodValidationPipe(expenseListQuerySchema)) query: ExpenseListQuery) {
    return this.service.list(query);
  }

  @Post()
  @UseGuards(CsrfGuard)
  record(
    @Body(new ZodValidationPipe(expenseInputSchema)) input: ExpenseInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.record(input, request.authenticatedUser!);
  }

  @Post(':id/reversal')
  @UseGuards(OwnerAuthorizationGuard, CsrfGuard)
  reverse(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(expenseReversalInputSchema)) input: ExpenseReversalInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.reverse(id, input, request.authenticatedUser!);
  }
}
