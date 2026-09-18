import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  cashShiftCloseInputSchema,
  cashShiftOpenInputSchema,
  type CashShiftCloseInput,
  type CashShiftOpenInput,
} from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { CashShiftService } from './cash-shift.service.js';

/** No PATCH or DELETE: a closed shift is a frozen record (BR-07). */
@Controller('cash-shifts')
@UseGuards(AuthenticationGuard)
export class CashShiftController {
  constructor(private readonly service: CashShiftService) {}

  @Get()
  list(@Req() request: ContextRequest) {
    return this.service.list(request.authenticatedUser!);
  }

  @Get('current')
  current() {
    return this.service.current();
  }

  @Post()
  @UseGuards(CsrfGuard)
  open(
    @Body(new ZodValidationPipe(cashShiftOpenInputSchema)) input: CashShiftOpenInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.open(input, request.authenticatedUser!);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CsrfGuard)
  close(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(cashShiftCloseInputSchema)) input: CashShiftCloseInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.close(id, input, request.authenticatedUser!);
  }
}
