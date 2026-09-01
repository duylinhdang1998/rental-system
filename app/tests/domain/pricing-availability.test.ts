import { describe, expect, it } from 'vitest';
import {
  billableRentalDays,
  calculateLateReturnFee,
  calculateTierPrice,
  applyPercentAdjustment,
  validatePricingTiers,
} from '../../apps/api/src/modules/pricing/pricing.policy';
import { intervalsOverlap } from '../../apps/api/src/modules/contracts/availability.policy';

describe('Feature: Pricing and availability policy', () => {
  it.each([
    ['2026-09-02T08:00:00.000Z', 1],
    ['2026-09-02T08:01:00.000Z', 2],
  ])('bills strict 24-hour blocks (%s)', (endAt, expected) => {
    expect(billableRentalDays('2026-09-01T08:00:00.000Z', endAt)).toBe(expected);
  });

  it.each([
    ['2026-09-02T09:00:00.000Z', 0, 0],
    ['2026-09-02T09:01:00.000Z', 1, 20_000],
    ['2026-09-02T10:00:00.000Z', 1, 20_000],
    ['2026-09-02T10:01:00.000Z', 2, 40_000],
  ])('charges each started late hour after 60 free minutes (%s)', (actualReturnAt, hours, fee) => {
    expect(
      calculateLateReturnFee('2026-09-02T08:00:00.000Z', actualReturnAt, {
        graceMinutes: 60,
        hourlyRateVnd: 20_000,
      }),
    ).toMatchObject({ billableLateHours: hours, feeVnd: fee });
  });

  it.each([
    [1, 150_000, 150_000],
    [5, 130_000, 650_000],
    [7, 100_000, 700_000],
  ])('selects the tier for %i days', (days, rate, subtotal) => {
    expect(
      calculateTierPrice(days, [
        { dailyRateVnd: 150_000, maxDays: 2, minDays: 1 },
        { dailyRateVnd: 130_000, maxDays: 6, minDays: 3 },
        { dailyRateVnd: 100_000, maxDays: null, minDays: 7 },
      ]),
    ).toEqual({ dailyRateVnd: rate, subtotalVnd: subtotal });
  });

  it('treats adjacent half-open rental intervals as available', () => {
    expect(
      intervalsOverlap(
        '2026-09-01T08:00:00.000Z',
        '2026-09-02T08:00:00.000Z',
        '2026-09-02T08:00:00.000Z',
        '2026-09-03T08:00:00.000Z',
      ),
    ).toBe(false);
    expect(
      intervalsOverlap(
        '2026-09-01T08:00:00.000Z',
        '2026-09-02T08:00:00.000Z',
        '2026-09-02T07:59:00.000Z',
        '2026-09-03T08:00:00.000Z',
      ),
    ).toBe(true);
  });

  it('rejects invalid durations and uncovered pricing days', () => {
    expect(() =>
      billableRentalDays('2026-09-02T08:00:00.000Z', '2026-09-01T08:00:00.000Z'),
    ).toThrow('Invalid rental interval');
    expect(() =>
      calculateLateReturnFee('invalid', '2026-09-01T08:00:00.000Z', {
        graceMinutes: 60,
        hourlyRateVnd: 20_000,
      }),
    ).toThrow('Invalid return time');
    expect(() =>
      calculateTierPrice(3, [{ dailyRateVnd: 150_000, maxDays: 2, minDays: 1 }]),
    ).toThrow('No pricing tier');
  });

  it('validates contiguous open-ended tiers and integer adjustments', () => {
    expect(applyPercentAdjustment(650_000, 10)).toBe(585_000);
    expect(validatePricingTiers([])).toBe(false);
    expect(validatePricingTiers([{ dailyRateVnd: 150_000, maxDays: 2, minDays: 1 }])).toBe(false);
    expect(
      validatePricingTiers([
        { dailyRateVnd: 150_000, maxDays: 2, minDays: 1 },
        { dailyRateVnd: 100_000, maxDays: null, minDays: 4 },
      ]),
    ).toBe(false);
    expect(
      validatePricingTiers([
        { dailyRateVnd: 150_000, maxDays: 2, minDays: 1 },
        { dailyRateVnd: 100_000, maxDays: null, minDays: 3 },
      ]),
    ).toBe(true);
  });
});
