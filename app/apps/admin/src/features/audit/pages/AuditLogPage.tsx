import { AuditFilters } from '@/features/audit/components/AuditFilters';
import { AuditHeader } from '@/features/audit/components/AuditHeader';
import { AuditTimeline } from '@/features/audit/components/AuditTimeline';
import { useAuditPage } from '@/features/audit/hooks/use-audit-page';
import { ViewState } from '@/shared/ui/ViewState';

const EMPTY_COPY = { description: 'auditEmptyBody', title: 'auditEmptyTitle' };

export function AuditLogPage() {
  const page = useAuditPage();
  if (page.events.isPending) return <ViewState state="loading" />;
  if (page.events.isError)
    return <ViewState onRetry={() => void page.events.refetch()} state="error" />;
  const list = page.events.data;
  return (
    <section className="grid gap-5">
      <AuditHeader count={list.count} />
      <AuditFilters page={page} />
      {list.items.length ? (
        <AuditTimeline items={list.items} />
      ) : (
        <ViewState copy={EMPTY_COPY} heading="section" state="empty" />
      )}
    </section>
  );
}
