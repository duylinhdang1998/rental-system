import { describe, expect, it } from 'vitest';
import { auditSearchParams } from '../../apps/admin/src/features/audit/api/audit-api';
import {
  actionTone,
  auditQueryFrom,
  metadataRows,
} from '../../apps/admin/src/features/audit/lib/audit-presentation';
import {
  employeeFieldIssues,
  employeeTone,
  passwordIssue,
  usernameIssue,
} from '../../apps/admin/src/features/employees/lib/employee-presentation';
import { formatCurrency } from '../../apps/admin/src/shared/i18n/locale';

const EVENT = {
  action: 'PRICE_OVERRIDDEN',
  actorId: 'demo-owner',
  actorName: 'Chủ cửa hàng',
  at: '2026-09-18T03:00:00.000Z',
  entityId: 'vehicle-001',
  entityType: 'VehicleQuote',
  metadata: { after: 600_000, before: 650_000, reason: 'Khách quen' },
};

describe('Feature: Employee account management — presentation', () => {
  describe('Scenario Outline: Employee input is validated', () => {
    it('reports translation keys for each invalid field and nothing when valid', () => {
      expect(employeeFieldIssues({ name: '', password: 'short', username: 'nv lan' })).toEqual({
        name: 'employeeNameIssue',
        password: 'employeePasswordIssue',
        username: 'employeeUsernameIssue',
      });
      expect(
        employeeFieldIssues({ name: 'Lan', password: 'MatKhau!2026x', username: 'nv.lan' }),
      ).toEqual({});
      expect(passwordIssue('MatKhau!2026x')).toBeUndefined();
      expect(usernameIssue('nv')).toBe('employeeUsernameIssue');
    });

    it('maps working accounts to a success badge and locked ones to neutral', () => {
      expect(employeeTone(true)).toBe('success');
      expect(employeeTone(false)).toBe('neutral');
    });
  });
});

describe('Feature: Owner audit log — presentation', () => {
  describe('Scenario: Owner reviews sensitive changes in the audit log', () => {
    it('shows old and new prices as VND and other metadata verbatim', () => {
      expect(metadataRows(EVENT, 'vi')).toEqual([
        { key: 'after', value: formatCurrency(600_000, 'vi') },
        { key: 'before', value: formatCurrency(650_000, 'vi') },
        { key: 'reason', value: 'Khách quen' },
      ]);
      expect(metadataRows({ ...EVENT, metadata: undefined }, 'en')).toEqual([]);
    });

    it('sends only complete filters to the API', () => {
      expect(
        auditQueryFrom({ action: '', entityType: 'Account', from: '2026-09', to: '2026-09-18' }),
      ).toEqual({
        entityType: 'Account',
        to: '2026-09-18',
      });
      expect(auditSearchParams({ entityType: 'Account', limit: 20 })).toBe(
        'entityType=Account&limit=20',
      );
      expect(auditSearchParams({})).toBe('');
    });

    it('tones sensitive actions as danger and creations as success', () => {
      expect(actionTone('EMPLOYEE_LOCKED')).toBe('danger');
      expect(actionTone('PRICE_OVERRIDDEN')).toBe('danger');
      expect(actionTone('CONTRACT_CREATED')).toBe('success');
      expect(actionTone('VEHICLE_STATUS_CHANGED')).toBe('info');
    });
  });
});
