import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import {
  createEmployeeInputSchema,
  employeeStatusInputSchema,
  resetPasswordInputSchema,
  type CreateEmployeeInput,
  type Employee,
  type EmployeeList,
  type EmployeeStatusInput,
  type ResetPasswordInput,
} from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { OwnerAuthorizationGuard } from '../../common/guards/authorization.guard.js';
import type { ContextRequest } from '../../common/http/request-context.js';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { EmployeeService } from './employee.service.js';

/** Owner-only at the API; the UI hides the route for Staff but never relies on that. */
@Controller('employees')
@UseGuards(AuthenticationGuard, OwnerAuthorizationGuard)
export class EmployeeController {
  constructor(private readonly service: EmployeeService) {}

  @Get()
  list(): Promise<EmployeeList> {
    return this.service.list();
  }

  @Post()
  @UseGuards(CsrfGuard)
  create(
    @Body(new ZodValidationPipe(createEmployeeInputSchema)) input: CreateEmployeeInput,
    @Req() request: ContextRequest,
  ): Promise<Employee> {
    return this.service.create(input, request.authenticatedUser!);
  }

  @Patch(':id/status')
  @UseGuards(CsrfGuard)
  setStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(employeeStatusInputSchema)) input: EmployeeStatusInput,
    @Req() request: ContextRequest,
  ): Promise<Employee> {
    return this.service.setActive(id, input.active, request.authenticatedUser!);
  }

  @Post(':id/password')
  @UseGuards(CsrfGuard)
  resetPassword(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(resetPasswordInputSchema)) input: ResetPasswordInput,
    @Req() request: ContextRequest,
  ): Promise<Employee> {
    return this.service.resetPassword(id, input.password, request.authenticatedUser!);
  }
}
