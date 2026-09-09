import { ViewState } from '@/shared/ui/ViewState';
import { ContractActions } from '@/features/contracts/components/detail/ContractActions';
import { ContractDetailHeader } from '@/features/contracts/components/detail/ContractDetailHeader';
import { ContractLineList } from '@/features/contracts/components/detail/ContractLineList';
import { ContractOverview } from '@/features/contracts/components/detail/ContractOverview';
import { ContractTimeline } from '@/features/contracts/components/detail/ContractTimeline';
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
      <ContractActions onAction={page.openDialog} status={contract.status} />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="grid gap-5 xl:col-span-2">
          <ContractLineList lines={contract.quote.lines} />
          <ContractTimeline events={contract.events} />
        </div>
        <ContractOverview contract={contract} />
      </div>
      <LifecycleDialogs
        contract={contract}
        dialog={page.dialog}
        mutations={page.mutations}
        onClose={page.closeDialog}
      />
    </section>
  );
}
