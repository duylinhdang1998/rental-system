import { describe, expect, it } from 'vitest';
import {
  normalizeEmail,
  normalizePhone,
} from '../../apps/api/src/modules/customers/contact-normalizer';
import { canTransitionVehicle } from '../../apps/api/src/modules/fleet/vehicle-transition.policy';

describe('Feature: Fleet, customer and catalog foundations — domain policies', () => {
  describe('Scenario: Potential duplicate customer is suggested before creation', () => {
    it('normalizes Vietnamese phone and email contact values', () => {
      expect(normalizePhone('0900 000 001')).toBe('+84900000001');
      expect(normalizePhone('+84 900-000-001')).toBe('+84900000001');
      expect(normalizePhone('84 900 000 001')).toBe('+84900000001');
      expect(normalizePhone('900000001')).toBe('+900000001');
      expect(normalizeEmail(' TEST@Example.com ')).toBe('test@example.com');
    });
  });

  describe('Scenario: Vehicle condition transitions are controlled', () => {
    it('allows condition transitions but rejects manual rental state', () => {
      expect(canTransitionVehicle('AVAILABLE', 'MAINTENANCE')).toBe(true);
      expect(canTransitionVehicle('MAINTENANCE', 'AVAILABLE')).toBe(true);
      expect(canTransitionVehicle('AVAILABLE', 'RENTED')).toBe(false);
      expect(canTransitionVehicle('AVAILABLE', 'RESERVED')).toBe(false);
    });
  });
});
