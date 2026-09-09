import { ViewState } from '@/shared/ui/ViewState';
import { ContractFilterBar } from '@/features/contracts/components/list/ContractFilterBar';
import { ContractList } from '@/features/contracts/components/list/ContractList';
import { ContractPageHeader } from '@/features/contracts/components/list/ContractPageHeader';
import { useContractListPage } from '@/features/contracts/hooks/use-contract-list-page';

const EMPTY_COPY = { description: 'contractListEmptyBody', title: 'contractListEmptyTitle' };

export function ContractListPage() {
  const page = useContractListPage();
  if (page.contracts.isPending) return <ViewState state="loading" />;
  if (page.contracts.isError)
    return <ViewState onRetry={() => void page.contracts.refetch()} state="error" />;
  return (
    <section className="grid gap-5">
      <ContractPageHeader />
      <ContractFilterBar filters={page.filters} update={page.update} />
      {page.contracts.data.items.length ? (
        <ContractList contracts={page.contracts.data.items} />
      ) : (
        <ViewState copy={EMPTY_COPY} state="empty" />
      )}
    </section>
  );
}
