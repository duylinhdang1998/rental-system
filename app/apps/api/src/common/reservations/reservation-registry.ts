import { Injectable } from '@nestjs/common';
import type { AvailabilityConflict, AvailabilityInput } from '@rental/contracts';

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MILLISECONDS_PER_SECOND = 1000;
const DAY_MS = HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MILLISECONDS_PER_SECOND;

interface ReservationRecord extends AvailabilityConflict {
  state: 'HELD' | 'RENTED';
}

@Injectable()
export class ReservationRegistry {
  private readonly records: ReservationRecord[] = [];

  add(input: AvailabilityInput, contractCode: string, state: ReservationRecord['state'] = 'HELD') {
    input.vehicleIds.forEach((vehicleId) =>
      this.records.push({
        contractCode,
        endAt: input.endAt,
        startAt: input.startAt,
        state,
        vehicleId,
      }),
    );
  }

  conflicts(input: AvailabilityInput): AvailabilityConflict[] {
    return this.records
      .filter(
        (record) =>
          input.vehicleIds.includes(record.vehicleId) &&
          Date.parse(input.startAt) < Date.parse(record.endAt) &&
          Date.parse(record.startAt) < Date.parse(input.endAt),
      )
      .map((record) => ({
        contractCode: record.contractCode,
        endAt: record.endAt,
        startAt: record.startAt,
        vehicleId: record.vehicleId,
      }));
  }

  state(vehicleId: string, date: string): ReservationRecord['state'] | undefined {
    const dayStart = Date.parse(`${date}T00:00:00.000Z`);
    const dayEnd = dayStart + DAY_MS;
    return this.records.find(
      (record) =>
        record.vehicleId === vehicleId &&
        dayStart < Date.parse(record.endAt) &&
        Date.parse(record.startAt) < dayEnd,
    )?.state;
  }
}
