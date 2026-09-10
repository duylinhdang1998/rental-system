import { ReturnVehicleDialog } from '@/features/contracts';
import { ReturnQueueHeader } from '@/features/returns/components/queue/ReturnQueueHeader';
import { ReturnQueueList } from '@/features/returns/components/queue/ReturnQueueList';
import { ReturnQueueSummary } from '@/features/returns/components/queue/ReturnQueueSummary';
import { useReturnQueuePage } from '@/features/returns/hooks/use-return-queue-page';
import { ViewState } from '@/shared/ui/ViewState';

const EMPTY_COPY = { description: 'returnQueueEmptyBody', title: 'returnQueueEmptyTitle' };

export function ReturnQueuePage() {
  const page = useReturnQueuePage();
  if (page.queue.isPending) return <ViewState state="loading" />;
  if (page.queue.isError)
    return <ViewState onRetry={() => void page.queue.refetch()} state="error" />;
  const queue = page.queue.data;
  return (
    <section className="grid gap-5">
      <ReturnQueueHeader generatedAt={queue.generatedAt} />
      <ReturnQueueSummary queue={queue} />
      {queue.items.length ? (
        <ReturnQueueList items={queue.items} onReturn={page.select} />
      ) : (
        <ViewState copy={EMPTY_COPY} heading="section" state="empty" />
      )}
      {page.selection ? (
        <ReturnVehicleDialog
          contractId={page.selection.contractId}
          onClose={page.clear}
          target={page.selection.target}
        />
      ) : null}
    </section>
  );
}
