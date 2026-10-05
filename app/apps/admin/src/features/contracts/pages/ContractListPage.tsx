import { QueryRegion } from '@/shared/ui/QueryRegion';
import { ContractEmptyState } from '@/features/contracts/components/list/ContractEmptyState';
import { ContractFilterBar } from '@/features/contracts/components/list/ContractFilterBar';
import { ContractList } from '@/features/contracts/components/list/ContractList';
import { ContractPageHeader } from '@/features/contracts/components/list/ContractPageHeader';
import { useContractListPage } from '@/features/contracts/hooks/use-contract-list-page';

export function ContractListPage() {
  const page = useContractListPage();
  const filtered = Boolean(page.filters.search || page.filters.status);
  return (
    <section className="grid gap-5">
      <ContractPageHeader />
      <ContractFilterBar filters={page.filters} update={page.update} />
      <QueryRegion query={page.contracts}>
        {(data) =>
          data.items.length ? (
            <ContractList contracts={data.items} />
          ) : (
            <ContractEmptyState filtered={filtered} />
          )
        }
      </QueryRegion>
    </section>
  );
}
