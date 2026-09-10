import { ViewState } from '@/shared/ui/ViewState';
import { ContractActions } from '@/features/contracts/components/detail/ContractActions';
import { ContractDetailBody } from '@/features/contracts/components/detail/ContractDetailBody';
import { ContractDetailHeader } from '@/features/contracts/components/detail/ContractDetailHeader';
import { LifecycleDialogs } from '@/features/contracts/components/lifecycle/LifecycleDialogs';
import { useContractDetailPage } from '@/features/contracts/hooks/use-contract-detail-page';

export function ContractDetailPage() {
  const page = useContractDetailPage();
  if (page.contract.isPending) return <ViewState state="loading" />;
  if (page.contract.isError)
    return <ViewState onRetry={() => void page.contract.refetch()} state="error" />;
  const contract = page.contract.data;
  return (
    <section className="grid gap-5">
      <ContractDetailHeader contract={contract} />
      <ContractActions
        onAction={page.openDialog}
        settled={contract.settledAt !== null}
        status={contract.status}
      />
      <ContractDetailBody
        contract={contract}
        onReturn={page.renting ? page.openReturn : undefined}
        statement={page.settlement}
      />
      <LifecycleDialogs
        contract={contract}
        dialog={page.dialog}
        isOwner={page.isOwner}
        mutations={page.mutations}
        onClose={page.closeDialog}
        statement={page.settlement.data}
      />
    </section>
  );
}
