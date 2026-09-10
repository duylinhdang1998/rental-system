import type { ReportContractRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { contractRowCells } from '@/features/reporting/lib/report-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface ReportContractLineProps {
  row: ReportContractRow;
}

export function ReportContractLine({ row }: ReportContractLineProps) {
  const { i18n } = useTranslation();
  const cells = contractRowCells(row, resolveInitialLocale(i18n.language));
  return (
    <TableRow data-report-row={row.code}>
      {cells.map((cell) => (
        <TableCell className="whitespace-nowrap" key={cell.key}>
          {cell.value}
        </TableCell>
      ))}
    </TableRow>
  );
}
