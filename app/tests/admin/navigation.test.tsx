import { describe, expect, it } from 'vitest';
import { navigationForRole } from '../../apps/admin/src/shared/navigation/routes';
import {
  formatCurrency,
  formatDate,
  resolveInitialLocale,
} from '../../apps/admin/src/shared/i18n/locale';

describe('Feature: Secure responsive operations preview — navigation and locale', () => {
  describe('Scenario: Staff cannot access Owner-only routes', () => {
    it('omits reports, employees and settings from Staff navigation', () => {
      const paths = navigationForRole('STAFF').map((item) => item.path);

      expect(paths).not.toContain('/reports');
      expect(paths).not.toContain('/employees');
      expect(paths).not.toContain('/settings');
    });
  });

  describe('Scenario: Owner can preview all Sprint 1 modules', () => {
    it('includes every approved preview route for Owner', () => {
      const paths = navigationForRole('OWNER').map((item) => item.path);

      expect(paths).toEqual(
        expect.arrayContaining([
          '/',
          '/vehicles',
          '/customers',
          '/contracts',
          '/returns',
          '/reports',
          '/employees',
          '/settings',
        ]),
      );
    });
  });

  describe('Scenario: Locale persists while route and filters are preserved', () => {
    it('restores a supported locale and formats VND without translating business data', () => {
      expect(resolveInitialLocale('en')).toBe('en');
      expect(resolveInitialLocale('unsupported')).toBe('vi');
      expect(formatCurrency(12_400_000, 'vi')).toContain('12.400.000');
      expect(formatCurrency(12_400_000, 'en')).toContain('12,400,000');
      const date = new Date('2026-08-31T00:00:00+07:00');
      expect(formatDate(date, 'vi')).toBe('31/08/2026');
      expect(formatDate(date, 'en')).toBe('08/31/2026');
    });
  });
});
