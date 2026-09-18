import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { vehicleAcquisitionInputSchema, type VehicleAcquisitionInput } from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { VehicleAcquisitionService } from './vehicle-acquisition.service.js';

@Controller('fleet/vehicles')
@UseGuards(AuthenticationGuard)
export class VehicleAcquisitionController {
  constructor(private readonly service: VehicleAcquisitionService) {}

  @Get(':id/acquisition')
  get(@Param('id') id: string) {
    return this.service.get(id);
  }

  /** US-023: only the Owner prices vehicles; PUT because the record is replaced whole. */
  @Put(':id/acquisition')
  @UseGuards(OwnerAuthorizationGuard, CsrfGuard)
  set(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(vehicleAcquisitionInputSchema)) input: VehicleAcquisitionInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.set(id, input, request.authenticatedUser!);
  }
}
