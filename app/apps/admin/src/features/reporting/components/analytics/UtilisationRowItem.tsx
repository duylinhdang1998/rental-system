import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { ShareCell } from '@/features/reporting/components/analytics/ShareCell';
import type { UtilisationCells } from '@/features/reporting/lib/analytics-presentation';

interface UtilisationRowItemProps {
  emphasis: boolean;
  row: UtilisationCells;
}

export function UtilisationRowItem({ emphasis, row }: UtilisationRowItemProps) {
  const { t } = useTranslation();
  return (
    <TableRow
      className={emphasis ? 'bg-panel-subtle font-black text-ink' : undefined}
      data-utilisation-row={row.label}
    >
      <TableCell className="whitespace-nowrap font-black text-ink">{row.label}</TableCell>
      <TableCell className="whitespace-nowrap tabular-nums">{row.days}</TableCell>
      <ShareCell label={t('utilisationShare', { percent: row.percent })} percent={row.percent} />
    </TableRow>
  );
}
