import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { AuditList, AuditQueryInput } from '@rental/contracts';
import { fetchAuditEvents } from '@/features/audit/api/audit-api';

export function useAuditEvents(query: AuditQueryInput): UseQueryResult<AuditList, Error> {
  return useQuery({
    placeholderData: (previous) => previous,
    queryFn: () => fetchAuditEvents(query),
    queryKey: ['audit', query],
  });
}
