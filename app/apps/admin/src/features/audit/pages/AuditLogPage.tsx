import { AuditFilters } from '@/features/audit/components/AuditFilters';
import { AuditHeader } from '@/features/audit/components/AuditHeader';
import { AuditTimeline } from '@/features/audit/components/AuditTimeline';
import { useAuditPage } from '@/features/audit/hooks/use-audit-page';
import { ViewState } from '@/shared/ui/ViewState';
import { QueryRegion } from '@/shared/ui/QueryRegion';

const EMPTY_COPY = { description: 'auditEmptyBody', title: 'auditEmptyTitle' };

export function AuditLogPage() {
  const page = useAuditPage();
  const list = page.events.data;
  return (
    <section className="grid gap-5">
      <AuditHeader count={list?.count ?? 0} />
      <AuditFilters page={page} />
      <QueryRegion query={page.events}>
        {(data) =>
          data.items.length ? (
            <AuditTimeline items={data.items} />
          ) : (
            <ViewState copy={EMPTY_COPY} heading="section" state="empty" />
          )
        }
      </QueryRegion>
    </section>
  );
}
