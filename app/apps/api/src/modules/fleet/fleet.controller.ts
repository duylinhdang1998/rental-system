import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  vehicleInputSchema,
  vehicleStatusSchema,
  vehicleTransitionSchema,
  vehicleTypeInputSchema,
  type VehicleInput,
  type VehicleTransitionInput,
  type VehicleTypeInput,
} from '@rental/contracts';
import { z } from 'zod';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { FleetService } from './fleet.service.js';

const vehicleQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: vehicleStatusSchema.optional(),
  typeCode: z.string().trim().optional(),
});
const calendarQuerySchema = z.object({
  from: z.iso.date(),
  to: z.iso.date(),
  typeCode: z.string().trim().optional(),
});

@Controller('fleet')
@UseGuards(AuthenticationGuard)
export class FleetController {
  constructor(private readonly service: FleetService) {}

  @Get('types')
  listTypes() {
    return this.service.listTypes();
  }

  @Post('types')
  @UseGuards(OwnerAuthorizationGuard, CsrfGuard)
  createType(
    @Body(new ZodValidationPipe(vehicleTypeInputSchema)) input: VehicleTypeInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.createType(input, request.authenticatedUser!);
  }

  @Get('vehicles')
  listVehicles(
    @Query(new ZodValidationPipe(vehicleQuerySchema)) query: z.infer<typeof vehicleQuerySchema>,
  ) {
    return this.service.listVehicles(query);
  }

  @Post('vehicles')
  @UseGuards(CsrfGuard)
  createVehicle(
    @Body(new ZodValidationPipe(vehicleInputSchema)) input: VehicleInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.createVehicle(input, request.authenticatedUser!);
  }

  @Get('calendar')
  calendar(
    @Query(new ZodValidationPipe(calendarQuerySchema)) query: z.infer<typeof calendarQuerySchema>,
  ) {
    return this.service.calendar(query);
  }

  @Patch('vehicles/:id/status')
  @UseGuards(CsrfGuard)
  transition(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(vehicleTransitionSchema))
    input: VehicleTransitionInput,
    @Req() request: ContextRequest,
  ) {
    return this.service.transition(id, input, request.authenticatedUser!);
  }

  @Get('vehicles/:id/history')
  statusHistory(@Param('id') id: string) {
    return this.service.statusHistory(id);
  }
}
