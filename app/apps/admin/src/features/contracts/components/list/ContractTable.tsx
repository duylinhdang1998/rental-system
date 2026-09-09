import type { ContractSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ContractTableRow } from '@/features/contracts/components/list/ContractTableRow';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';

interface ContractTableProps {
  contracts: ContractSummary[];
}

export function ContractTable({ contracts }: ContractTableProps) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-hidden sm:block">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            <TableHead>{t('contracts')}</TableHead>
            <TableHead>{t('vehicles')}</TableHead>
            <TableHead>{t('contractPeriod')}</TableHead>
            <TableHead>{t('contractTotal')}</TableHead>
            <TableHead>{t('status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contracts.map((contract) => (
            <ContractTableRow contract={contract} key={contract.id} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
