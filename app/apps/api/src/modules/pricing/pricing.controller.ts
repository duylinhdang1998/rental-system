import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  publishPricingInputSchema,
  quoteInputSchema,
  type PublishPricingInput,
  type QuoteInput,
} from '@rental/contracts';
import { z } from 'zod';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { PricingService } from './pricing.service.js';

const MAX_TYPE_CODE = 24;
const currentQuerySchema = z.object({ typeCode: z.string().trim().min(2).max(MAX_TYPE_CODE) });

@Controller('pricing')
@UseGuards(AuthenticationGuard)
export class PricingController {
  constructor(private readonly service: PricingService) {}

  @Get('current')
  current(
    @Query(new ZodValidationPipe(currentQuerySchema)) query: z.infer<typeof currentQuerySchema>,
  ) {
    return this.service.current(query.typeCode);
  }

  @Post('versions')
  @UseGuards(OwnerAuthorizationGuard, CsrfGuard)
  publish(
    @Body(new ZodValidationPipe(publishPricingInputSchema)) input: PublishPricingInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.publish(input, request.authenticatedUser!);
  }

  @Post('quote')
  @UseGuards(CsrfGuard)
  quote(
    @Body(new ZodValidationPipe(quoteInputSchema)) input: QuoteInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.quote(input, request.authenticatedUser!);
  }
}
