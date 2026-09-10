import { type DynamicModule, Module } from '@nestjs/common';
import type { Environment } from './config/environment.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { DemoModule } from './modules/demo/demo.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuditModule } from './common/audit/audit.module.js';
import { FleetModule } from './modules/fleet/fleet.module.js';
import { CustomerModule } from './modules/customers/customer.module.js';
import { ContractModule } from './modules/contracts/contract.module.js';
import { ReservationModule } from './common/reservations/reservation.module.js';
import { FinanceModule } from './modules/finance/finance.module.js';

@Module({})
export class AppModule {
  static forRoot(environment: Environment): DynamicModule {
    const optionalImports = environment.DEMO_MODE ? [DemoModule] : [];
    const customers = CustomerModule.register(environment);
    const contracts = ContractModule.register(environment);
    return {
      module: AppModule,
      imports: [
        AuditModule.register(environment),
        ReservationModule,
        HealthModule,
        AuthModule.register(environment),
        customers,
        FleetModule.register(environment),
        contracts,
        FinanceModule.register(contracts, customers),
        ...optionalImports,
      ],
    };
  }
}
