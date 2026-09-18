import { useState } from 'react';
import { useAuditEvents } from '@/features/audit/hooks/use-audit-events';
import { auditQueryFrom, type AuditFilters } from '@/features/audit/lib/audit-presentation';

const EMPTY_FILTERS: AuditFilters = { action: '', entityType: '', from: '', to: '' };

export function useAuditPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const events = useAuditEvents(auditQueryFrom(filters));
  const change = (field: keyof AuditFilters, value: string) =>
    setFilters((current) => ({ ...current, [field]: value }));
  return { change, events, filters, reset: () => setFilters(EMPTY_FILTERS) };
}

export type AuditPage = ReturnType<typeof useAuditPage>;
