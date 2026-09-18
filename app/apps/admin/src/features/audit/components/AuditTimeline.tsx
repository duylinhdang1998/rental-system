import type { AuditEventView } from '@rental/contracts';
import { AuditEntry } from '@/features/audit/components/AuditEntry';

interface AuditTimelineProps {
  items: AuditEventView[];
}

/** Newest first, as the API orders it; keys combine time, action and entity for stability. */
export function AuditTimeline({ items }: AuditTimelineProps) {
  return (
    <ol className="grid gap-3">
      {items.map((event) => (
        <AuditEntry event={event} key={`${event.at}-${event.action}-${event.entityId}`} />
      ))}
    </ol>
  );
}
