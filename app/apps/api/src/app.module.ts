import { type DynamicModule, Module } from '@nestjs/common';
import type { Environment } from './config/environment.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { DemoModule } from './modules/demo/demo.module.js';
import { HealthModule } from './modules/health/health.module.js';

@Module({})
export class AppModule {
  static forRoot(environment: Environment): DynamicModule {
    const optionalImports = environment.DEMO_MODE ? [DemoModule] : [];
    return {
      module: AppModule,
      imports: [HealthModule, AuthModule.register(environment), ...optionalImports],
    };
  }
}
