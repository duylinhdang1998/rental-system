import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
  availabilityInputSchema,
  contractCreateInputSchema,
  contractListQuerySchema,
  lateReturnFeeInputSchema,
  type AvailabilityInput,
  type ContractCreateInput,
  type ContractListQuery,
  type LateReturnFeeInput,
} from '@rental/contracts';
import type { Response } from 'express';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { ContractBoardService } from './contract-board.service.js';
import { ContractPdfService } from './contract-pdf.service.js';
import { ContractService } from './contract.service.js';

@Controller('contracts')
@UseGuards(AuthenticationGuard)
export class ContractController {
  constructor(
    private readonly service: ContractService,
    private readonly board: ContractBoardService,
    private readonly pdfs: ContractPdfService,
  ) {}

  @Get()
  list(@Query(new ZodValidationPipe(contractListQuerySchema)) query: ContractListQuery) {
    return this.board.list(query);
  }

  /** Declared before `:id` so the static segment wins route matching. */
  @Get('board')
  operationsBoard() {
    return this.board.board();
  }

  @Post('availability')
  @UseGuards(CsrfGuard)
  availability(@Body(new ZodValidationPipe(availabilityInputSchema)) input: AvailabilityInput) {
    return this.service.availability(input);
  }

  @Post()
  @UseGuards(CsrfGuard)
  create(
    @Body(new ZodValidationPipe(contractCreateInputSchema)) input: ContractCreateInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.create(input, request.authenticatedUser!);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  @Post(':id/late-return-fee')
  @UseGuards(CsrfGuard)
  lateReturnFee(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(lateReturnFeeInputSchema)) input: LateReturnFeeInput,
  ) {
    return this.service.lateReturnFee(id, input);
  }

  @Get(':id/handover-images')
  images(@Param('id') id: string) {
    return this.service.imageAccess(id);
  }

  @Get(':id/pdf')
  async pdf(@Param('id') id: string, @Res() response: Response) {
    const bytes = await this.pdfs.generate(await this.service.get(id));
    response.setHeader('content-type', 'application/pdf');
    response.setHeader('content-disposition', `attachment; filename="contract-${id}.pdf"`);
    response.send(Buffer.from(bytes));
  }
}
