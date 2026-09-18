import type { Utilisation } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { UtilisationRowItem } from '@/features/reporting/components/analytics/UtilisationRowItem';
import { utilisationTableRows } from '@/features/reporting/lib/analytics-presentation';

interface UtilisationTableProps {
  utilisation: Utilisation;
}

const COLUMNS = ['label', 'days', 'percent'] as const;

/** Vehicles first, then their types, then the whole fleet: three levels of the same ratio. */
export function UtilisationTable({ utilisation }: UtilisationTableProps) {
  const { t } = useTranslation();
  const rows = utilisationTableRows(utilisation, t('utilisationFleet'));
  return (
    <section className="surface-card overflow-x-auto" data-utilisation-table>
      <h2 className="px-4 pt-4 text-lg font-extrabold text-ink">
        {t('analyticsSections.utilisation')}
      </h2>
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            {COLUMNS.map((key) => (
              <TableHead key={key}>{t(`utilisationColumns.${key}`)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <UtilisationRowItem emphasis={row.emphasis} key={row.key} row={row} />
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
