import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { customerInputSchema, type CustomerInput } from '@rental/contracts';
import { z } from 'zod';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { CustomerService } from './customer.service.js';

const searchSchema = z.object({ search: z.string().trim().optional() });
const MIN_PHONE_LENGTH = 3;
const duplicateSchema = z.object({ phone: z.string().trim().min(MIN_PHONE_LENGTH) });

@Controller('customers')
@UseGuards(AuthenticationGuard)
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Get()
  list(@Query(new ZodValidationPipe(searchSchema)) query: z.infer<typeof searchSchema>) {
    return this.service.list(query.search);
  }

  @Post()
  @UseGuards(CsrfGuard)
  create(
    @Body(new ZodValidationPipe(customerInputSchema)) input: CustomerInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.create(this.service.normalizeInput(input), request.authenticatedUser!);
  }

  @Get('duplicates')
  duplicates(
    @Query(new ZodValidationPipe(duplicateSchema)) query: z.infer<typeof duplicateSchema>,
  ) {
    return this.service.duplicates(query.phone);
  }

  @Get(':customerId/documents/:documentId/access')
  access(
    @Param('customerId') customerId: string,
    @Param('documentId') documentId: string,
    @Req() request: ContextRequest,
  ) {
    return this.service.documentAccess(customerId, documentId, request.authenticatedUser!);
  }
}
