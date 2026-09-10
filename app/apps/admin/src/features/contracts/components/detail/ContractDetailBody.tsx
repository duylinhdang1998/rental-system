import type { UseQueryResult } from '@tanstack/react-query';
import type {
  ContractLedger,
  ContractLine,
  RentalContract,
  SettlementStatement,
} from '@rental/contracts';
import { ContractLineList } from '@/features/contracts/components/detail/ContractLineList';
import { ContractOverview } from '@/features/contracts/components/detail/ContractOverview';
import { ContractTimeline } from '@/features/contracts/components/detail/ContractTimeline';
import { LedgerPanel } from '@/features/contracts/components/payments/LedgerPanel';
import { SettlementPanel } from '@/features/contracts/components/settlement/SettlementPanel';
import { showsLedger, showsSettlement } from '@/features/contracts/lib/contract-presentation';

interface ContractDetailBodyProps {
  contract: RentalContract;
  ledger: UseQueryResult<ContractLedger, Error>;
  onReturn?: ((line: ContractLine) => void) | undefined;
  statement: UseQueryResult<SettlementStatement, Error>;
}

export function ContractDetailBody(props: ContractDetailBodyProps) {
  const { contract, ledger, onReturn, statement } = props;
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      <div className="grid gap-5 xl:col-span-2">
        <ContractLineList lines={contract.quote.lines} onReturn={onReturn} />
        {showsSettlement(contract.status) ? (
          <SettlementPanel contract={contract} statement={statement} />
        ) : null}
        {showsLedger(contract.status) ? <LedgerPanel ledger={ledger} /> : null}
        <ContractTimeline events={contract.events} />
      </div>
      <ContractOverview contract={contract} />
    </div>
  );
}
