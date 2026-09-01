import { type DynamicModule, Module, type Provider } from '@nestjs/common';
import type { Environment } from '../../config/environment.js';
import { PrismaService } from '../../database/prisma.service.js';
import { CustomerController } from './customer.controller.js';
import { CustomerService } from './customer.service.js';
import { CUSTOMER_REPOSITORY } from './customer.tokens.js';
import { DemoCustomerRepository } from './demo-customer.repository.js';
import { PrismaCustomerRepository } from './prisma-customer.repository.js';
import { PrivateFileService } from './private-file.service.js';

function providers(environment: Environment): Provider[] {
  if (environment.DEMO_MODE) {
    return [{ provide: CUSTOMER_REPOSITORY, useClass: DemoCustomerRepository }];
  }
  return [PrismaService, { provide: CUSTOMER_REPOSITORY, useClass: PrismaCustomerRepository }];
}

@Module({})
export class CustomerModule {
  static register(environment: Environment): DynamicModule {
    return {
      controllers: [CustomerController],
      module: CustomerModule,
      providers: [...providers(environment), CustomerService, PrivateFileService],
    };
  }
}
