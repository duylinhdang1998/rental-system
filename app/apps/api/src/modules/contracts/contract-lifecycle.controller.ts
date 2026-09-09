import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  contractCancelInputSchema,
  contractExtendInputSchema,
  contractSwapInputSchema,
  type ContractCancelInput,
  type ContractExtendInput,
  type ContractSwapInput,
} from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { ContractExtensionService } from './contract-extension.service.js';
import { ContractLifecycleService } from './contract-lifecycle.service.js';
import { ContractSwapService } from './contract-swap.service.js';

@Controller('contracts')
@UseGuards(AuthenticationGuard, CsrfGuard)
export class ContractLifecycleController {
  constructor(
    private readonly lifecycle: ContractLifecycleService,
    private readonly extensions: ContractExtensionService,
    private readonly swaps: ContractSwapService,
  ) {}

  @Post('lifecycle/evaluate')
  evaluate() {
    return this.lifecycle.evaluateOverdue();
  }

  @Post(':id/activate')
  activate(@Param('id') id: string, @Req() request: ContextRequest) {
    return this.lifecycle.activate(id, request.authenticatedUser!);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(contractCancelInputSchema)) input: ContractCancelInput,
    @Req() request: ContextRequest,
  ) {
    return this.lifecycle.cancel(id, input, request.authenticatedUser!);
  }

  @Post(':id/complete')
  complete(@Param('id') id: string, @Req() request: ContextRequest) {
    return this.lifecycle.complete(id, request.authenticatedUser!);
  }

  @Post(':id/extend')
  extend(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(contractExtendInputSchema)) input: ContractExtendInput,
    @Req() request: ContextRequest,
  ) {
    return this.extensions.extend(id, input, request.authenticatedUser!);
  }

  @Post(':id/swap')
  swap(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(contractSwapInputSchema)) input: ContractSwapInput,
    @Req() request: ContextRequest,
  ) {
    return this.swaps.swap(id, input, request.authenticatedUser!);
  }
}
