import type { ContractSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ContractStatusBadge } from '@/features/contracts/components/list/ContractStatusBadge';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { formatCurrency, formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface ContractTableRowProps {
  contract: ContractSummary;
}

export function ContractTableRow({ contract }: ContractTableRowProps) {
  const { i18n } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <TableRow>
      <TableCell className="font-extrabold">
        <Link className="text-brand hover:underline" to={`/contracts/${contract.id}`}>
          {contract.code}
        </Link>
        <span className="block text-xs font-semibold text-ink-muted">{contract.customerName}</span>
      </TableCell>
      <TableCell>{contract.vehicleCodes.join(', ')}</TableCell>
      <TableCell>
        {formatDateTime(contract.startAt, locale)}
        <span className="block text-xs text-ink-muted">
          → {formatDateTime(contract.endAt, locale)}
        </span>
      </TableCell>
      <TableCell className="font-bold">{formatCurrency(contract.totalVnd, locale)}</TableCell>
      <TableCell>
        <ContractStatusBadge status={contract.status} />
      </TableCell>
    </TableRow>
  );
}
