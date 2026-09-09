import type { ContractSummary } from '@rental/contracts';
import { ContractCard } from '@/features/contracts/components/list/ContractCard';
import { ContractTable } from '@/features/contracts/components/list/ContractTable';

interface ContractListProps {
  contracts: ContractSummary[];
}

export function ContractList({ contracts }: ContractListProps) {
  return (
    <div className="grid gap-3">
      {contracts.map((contract) => (
        <ContractCard contract={contract} key={contract.id} />
      ))}
      <ContractTable contracts={contracts} />
    </div>
  );
}
