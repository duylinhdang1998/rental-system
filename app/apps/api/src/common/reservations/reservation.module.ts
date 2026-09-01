import { Global, Module } from '@nestjs/common';
import { ReservationRegistry } from './reservation-registry.js';

@Global()
@Module({ exports: [ReservationRegistry], providers: [ReservationRegistry] })
export class ReservationModule {}
