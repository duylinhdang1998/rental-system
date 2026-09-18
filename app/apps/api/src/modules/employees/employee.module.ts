import { Module } from '@nestjs/common';
import { EmployeeController } from './employee.controller.js';
import { EmployeeService } from './employee.service.js';

/** Uses the global auth repositories; no second account store exists. */
@Module({ controllers: [EmployeeController], providers: [EmployeeService] })
export class EmployeeModule {}
