import { type DynamicModule, Module } from '@nestjs/common';
import type { Environment } from './config/environment.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { DemoModule } from './modules/demo/demo.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { AuditModule } from './common/audit/audit.module.js';
import { FleetModule } from './modules/fleet/fleet.module.js';
import { CustomerModule } from './modules/customers/customer.module.js';

@Module({})
export class AppModule {
  static forRoot(environment: Environment): DynamicModule {
    const optionalImports = environment.DEMO_MODE ? [DemoModule] : [];
    return {
      module: AppModule,
      imports: [
        AuditModule.register(environment),
        HealthModule,
        AuthModule.register(environment),
        CustomerModule.register(environment),
        FleetModule.register(environment),
        ...optionalImports,
      ],
    };
  }
}
