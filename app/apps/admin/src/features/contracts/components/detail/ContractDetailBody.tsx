import type { UseQueryResult } from '@tanstack/react-query';
import type { ContractLine, RentalContract, SettlementStatement } from '@rental/contracts';
import { ContractLineList } from '@/features/contracts/components/detail/ContractLineList';
import { ContractOverview } from '@/features/contracts/components/detail/ContractOverview';
import { ContractTimeline } from '@/features/contracts/components/detail/ContractTimeline';
import { SettlementPanel } from '@/features/contracts/components/settlement/SettlementPanel';
import { showsSettlement } from '@/features/contracts/lib/contract-presentation';

interface ContractDetailBodyProps {
  contract: RentalContract;
  onReturn?: ((line: ContractLine) => void) | undefined;
  statement: UseQueryResult<SettlementStatement, Error>;
}

export function ContractDetailBody({ contract, onReturn, statement }: ContractDetailBodyProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="grid gap-5 xl:col-span-2">
        <ContractLineList lines={contract.quote.lines} onReturn={onReturn} />
        {showsSettlement(contract.status) ? (
          <SettlementPanel contract={contract} statement={statement} />
        ) : null}
        <ContractTimeline events={contract.events} />
      </div>
      <ContractOverview contract={contract} />
    </div>
  );
}
