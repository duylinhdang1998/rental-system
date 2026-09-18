import { type DynamicModule, Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';
import { RequestThrottleGuard } from '../guards/request-throttle.guard.js';
import { RequestThrottleService } from './request-throttle.service.js';

@Global()
@Module({})
export class ThrottleModule {
  static register(environment: Environment): DynamicModule {
    return {
      exports: [RequestThrottleService],
      module: ThrottleModule,
      providers: [
        { provide: ENVIRONMENT, useValue: environment },
        RequestThrottleService,
        { provide: APP_GUARD, useClass: RequestThrottleGuard },
      ],
    };
  }
}
