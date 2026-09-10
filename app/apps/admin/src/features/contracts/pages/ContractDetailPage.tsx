import { ContractDetailContent } from '@/features/contracts/components/detail/ContractDetailContent';
import { useContractDetailPage } from '@/features/contracts/hooks/use-contract-detail-page';
import { ViewState } from '@/shared/ui/ViewState';

export function ContractDetailPage() {
  const page = useContractDetailPage();
  if (page.contract.isPending) return <ViewState state="loading" />;
  if (page.contract.isError)
    return <ViewState onRetry={() => void page.contract.refetch()} state="error" />;
  return <ContractDetailContent contract={page.contract.data} page={page} />;
}
