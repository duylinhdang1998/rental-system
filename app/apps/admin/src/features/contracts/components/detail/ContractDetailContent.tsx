import type { RentalContract } from '@rental/contracts';
import { ContractActions } from '@/features/contracts/components/detail/ContractActions';
import { ContractDetailBody } from '@/features/contracts/components/detail/ContractDetailBody';
import { ContractDetailHeader } from '@/features/contracts/components/detail/ContractDetailHeader';
import { LifecycleDialogs } from '@/features/contracts/components/lifecycle/LifecycleDialogs';
import type { ContractDetailPageState } from '@/features/contracts/hooks/use-contract-detail-page';

interface ContractDetailContentProps {
  contract: RentalContract;
  page: ContractDetailPageState;
}

export function ContractDetailContent({ contract, page }: ContractDetailContentProps) {
  return (
    <section className="grid gap-5">
      <ContractDetailHeader contract={contract} />
      <ContractActions
        depositRefundDue={page.depositRefundDue}
        onAction={page.openDialog}
        openReceivable={page.openReceivable}
        settled={contract.settledAt !== null}
        status={contract.status}
      />
      <ContractDetailBody
        contract={contract}
        ledger={page.ledger}
        onReturn={page.renting ? page.openReturn : undefined}
        statement={page.settlement}
      />
      <LifecycleDialogs
        contract={contract}
        dialog={page.dialog}
        isOwner={page.isOwner}
        ledger={page.ledger.data}
        mutations={page.mutations}
        onClose={page.closeDialog}
        statement={page.settlement.data}
      />
    </section>
  );
}
