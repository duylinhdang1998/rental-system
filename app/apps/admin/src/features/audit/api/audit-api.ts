import { auditListSchema, type AuditList, type AuditQueryInput } from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

function paramText(value: unknown): string {
  if (typeof value === 'number') return String(value);
  return typeof value === 'string' ? value : '';
}

export function auditSearchParams(query: AuditQueryInput): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    const text = paramText(value);
    if (text !== '') params.set(key, text);
  }
  return params.toString();
}

export async function fetchAuditEvents(query: AuditQueryInput): Promise<AuditList> {
  const search = auditSearchParams(query);
  return auditListSchema.parse(await apiRequest(`/api/audit${search ? `?${search}` : ''}`));
}
