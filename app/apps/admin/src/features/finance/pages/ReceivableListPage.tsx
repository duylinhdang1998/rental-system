import { ContractPaymentDialog } from '@/features/contracts';
import { ReceivableHeader } from '@/features/finance/components/list/ReceivableHeader';
import { ReceivableList } from '@/features/finance/components/list/ReceivableList';
import { ReceivableSummary } from '@/features/finance/components/list/ReceivableSummary';
import { useReceivablePage } from '@/features/finance/hooks/use-receivable-page';
import { receivableBalance } from '@/features/finance/lib/receivable-presentation';
import { ViewState } from '@/shared/ui/ViewState';

const EMPTY_COPY = { description: 'receivableEmptyBody', title: 'receivableEmptyTitle' };

export function ReceivableListPage() {
  const page = useReceivablePage();
  if (page.receivables.isPending) return <ViewState state="loading" />;
  if (page.receivables.isError)
    return <ViewState onRetry={() => void page.receivables.refetch()} state="error" />;
  const list = page.receivables.data;
  return (
    <section className="grid gap-5">
      <ReceivableHeader generatedAt={list.generatedAt} />
      <ReceivableSummary list={list} />
      {list.items.length ? (
        <ReceivableList items={list.items} onCollect={page.select} />
      ) : (
        <ViewState copy={EMPTY_COPY} heading="section" state="empty" />
      )}
      {page.selection ? (
        <ContractPaymentDialog
          balance={receivableBalance(page.selection)}
          contractId={page.selection.contractId}
          onClose={page.clear}
        />
      ) : null}
    </section>
  );
}
