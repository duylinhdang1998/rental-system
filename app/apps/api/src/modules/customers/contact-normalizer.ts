const VIETNAM_PREFIX_LENGTH = 3;

export function normalizePhone(value: string): string {
  const compact = value.replace(/[^\d+]/g, '');
  if (compact.startsWith('+84'))
    return `+84${compact.slice(VIETNAM_PREFIX_LENGTH).replace(/\D/g, '')}`;
  if (compact.startsWith('84')) return `+84${compact.slice(2).replace(/\D/g, '')}`;
  if (compact.startsWith('0')) return `+84${compact.slice(1).replace(/\D/g, '')}`;
  return compact.startsWith('+') ? compact : `+${compact}`;
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeContact(type: 'EMAIL' | 'PHONE', value: string): string {
  return type === 'PHONE' ? normalizePhone(value) : normalizeEmail(value);
}
