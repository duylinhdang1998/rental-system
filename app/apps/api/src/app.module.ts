import { type DynamicModule, Module } from '@nestjs/common';
import type { Environment } from './config/environment.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { DemoModule } from './modules/demo/demo.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuditModule } from './common/audit/audit.module.js';
import { LoggingModule } from './common/logging/logging.module.js';
import type { LogSink } from './common/logging/structured-logger.js';
import { ThrottleModule } from './common/throttle/throttle.module.js';
import { FleetModule } from './modules/fleet/fleet.module.js';
import { CustomerModule } from './modules/customers/customer.module.js';
import { ContractModule } from './modules/contracts/contract.module.js';
import { ReservationModule } from './common/reservations/reservation.module.js';
import { FinanceModule } from './modules/finance/finance.module.js';
import { AuditQueryModule } from './modules/audit/audit-query.module.js';
import { EmployeeModule } from './modules/employees/employee.module.js';
import { EconomicsModule } from './modules/economics/economics.module.js';
import { FileStoreModule } from './common/files/file-store.module.js';
import { DamageCatalogModule } from './modules/damage-catalog/damage-catalog.module.js';
import { CashShiftModule } from './modules/cash-shifts/cash-shift.module.js';

@Module({})
export class AppModule {
  static forRoot(environment: Environment, logSink?: LogSink): DynamicModule {
    const optionalImports = environment.DEMO_MODE ? [DemoModule] : [];
    const customers = CustomerModule.register(environment);
    const contracts = ContractModule.register(environment);
    const economics = EconomicsModule.register(environment, contracts);
    return {
      module: AppModule,
      imports: [
        LoggingModule.register(logSink),
        AuditModule.register(environment),
        ThrottleModule.register(environment),
        ReservationModule,
        HealthModule.register(environment),
        AuthModule.register(environment),
        FileStoreModule.register(environment),
        DamageCatalogModule.register(environment),
        customers,
        FleetModule.register(environment),
        contracts,
        FinanceModule.register(contracts, customers),
        AuditQueryModule,
        EmployeeModule,
        economics,
        CashShiftModule.register(environment, contracts, economics),
        ...optionalImports,
      ],
    };
  }
}
