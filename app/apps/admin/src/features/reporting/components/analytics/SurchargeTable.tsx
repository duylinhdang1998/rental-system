import type { SurchargeRow } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { SurchargeRows } from '@/features/reporting/components/analytics/SurchargeRows';

interface SurchargeTableProps {
  netVnd: number;
  rows: readonly SurchargeRow[];
}

const COLUMNS = ['kind', 'count', 'amount'] as const;

export function SurchargeTable({ netVnd, rows }: SurchargeTableProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card overflow-x-auto" data-surcharge-table>
      <h2 className="px-4 pt-4 text-lg font-extrabold text-ink">
        {t('analyticsSections.surcharges')}
      </h2>
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            {COLUMNS.map((key) => (
              <TableHead key={key}>{t(`surchargeColumns.${key}`)}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <SurchargeRows netVnd={netVnd} rows={rows} />
        </TableBody>
      </Table>
    </section>
  );
}
