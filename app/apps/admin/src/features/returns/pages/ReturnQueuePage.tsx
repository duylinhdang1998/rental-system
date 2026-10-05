import { ReturnVehicleDialog } from '@/features/contracts';
import { ReturnQueueHeader } from '@/features/returns/components/queue/ReturnQueueHeader';
import { ReturnQueueList } from '@/features/returns/components/queue/ReturnQueueList';
import { ReturnQueueSummary } from '@/features/returns/components/queue/ReturnQueueSummary';
import { useReturnQueuePage } from '@/features/returns/hooks/use-return-queue-page';
import { ViewState } from '@/shared/ui/ViewState';
import { QueryRegion } from '@/shared/ui/QueryRegion';

const EMPTY_COPY = { description: 'returnQueueEmptyBody', title: 'returnQueueEmptyTitle' };

export function ReturnQueuePage() {
  const page = useReturnQueuePage();
  return (
    <section className="grid gap-5">
      <ReturnQueueHeader generatedAt={page.queue.data?.generatedAt} />
      <QueryRegion query={page.queue}>
        {(queue) => (
          <div className="grid gap-5">
            <ReturnQueueSummary queue={queue} />
            {queue.items.length ? (
              <ReturnQueueList items={queue.items} onReturn={page.select} />
            ) : (
              <ViewState copy={EMPTY_COPY} heading="section" state="empty" />
            )}
          </div>
        )}
      </QueryRegion>
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
