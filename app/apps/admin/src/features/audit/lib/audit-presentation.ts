import type { AuditEventView, AuditQueryInput } from '@rental/contracts';
import { formatCurrency, type Locale } from '@/shared/i18n/locale';

export interface AuditFilters {
  action: string;
  entityType: string;
  from: string;
  to: string;
}

export interface MetadataRow {
  key: string;
  value: string;
}

export const AUDIT_ENTITY_TYPES = [
  'Account',
  'Contract',
  'Customer',
  'CustomerDocument',
  'Expense',
  'PricingVersion',
  'Vehicle',
  'VehicleAcquisition',
  'VehicleQuote',
  'VehicleType',
] as const;

export const AUDIT_ACTIONS = [
  'CONTRACT_ACTIVATED',
  'CONTRACT_CANCELLED',
  'CONTRACT_CHARGE_ADDED',
  'CONTRACT_COMPLETED',
  'CONTRACT_CREATED',
  'CONTRACT_EXTENDED',
  'CONTRACT_PAYMENT_RECORDED',
  'CONTRACT_SETTLED',
  'CONTRACT_VEHICLE_RETURNED',
  'CONTRACT_VEHICLE_SWAPPED',
  'CUSTOMER_CREATED',
  'CUSTOMER_DOCUMENT_ACCESSED',
  'EMPLOYEE_CREATED',
  'EMPLOYEE_LOCKED',
  'EMPLOYEE_PASSWORD_RESET',
  'EMPLOYEE_UNLOCKED',
  'EXPENSE_RECORDED',
  'EXPENSE_REVERSED',
  'PRICE_OVERRIDDEN',
  'PRICING_PUBLISHED',
  'VEHICLE_ACQUISITION_SET',
  'VEHICLE_CREATED',
  'VEHICLE_STATUS_CHANGED',
  'VEHICLE_TYPE_CREATED',
] as const;

const MONEY_KEY = /vnd|before|after|amount|price/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SENSITIVE_TONE = /PASSWORD|LOCKED|CANCELLED|OVERRIDDEN|DOCUMENT_ACCESSED|REVERSED/;
const POSITIVE_TONE = /CREATED|COMPLETED|SETTLED|PUBLISHED|UNLOCKED|PAYMENT|RECORDED|ACQUISITION/;

/** Only well-formed dates reach the API; a half-typed field does not fire a query. */
export function auditQueryFrom(filters: AuditFilters): AuditQueryInput {
  return {
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.entityType ? { entityType: filters.entityType } : {}),
    ...(DATE_PATTERN.test(filters.from) ? { from: filters.from } : {}),
    ...(DATE_PATTERN.test(filters.to) ? { to: filters.to } : {}),
  };
}

/** Money-like metadata (old/new price, amounts) is shown as VND; everything else verbatim. */
export function metadataRows(event: AuditEventView, locale: Locale): MetadataRow[] {
  return Object.entries(event.metadata ?? {}).map(([key, value]) => ({
    key,
    value:
      typeof value === 'number' && MONEY_KEY.test(key)
        ? formatCurrency(value, locale)
        : String(value ?? '—'),
  }));
}

export function actionTone(action: string): 'danger' | 'info' | 'success' {
  if (SENSITIVE_TONE.test(action)) return 'danger';
  return POSITIVE_TONE.test(action) ? 'success' : 'info';
}
