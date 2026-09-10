import type { RevenueReport } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ReportMoneyTables } from '@/features/reporting/components/layout/ReportMoneyTables';
import { ReportTotals } from '@/features/reporting/components/summary/ReportTotals';
import { ReportAgingList } from '@/features/reporting/components/tables/ReportAgingList';
import { ReportContractTable } from '@/features/reporting/components/tables/ReportContractTable';

interface ReportContentProps {
  report: RevenueReport;
}

export function ReportContent({ report }: ReportContentProps) {
  const { t } = useTranslation();
  return (
    <>
      <ReportTotals totals={report.totals} />
      {report.totals.paymentCount ? (
        <ReportMoneyTables report={report} />
      ) : (
        <p className="surface-card p-4 font-semibold text-ink-muted" data-report-empty>
          {t('reportEmpty')}
        </p>
      )}
      <ReportAgingList aging={report.aging} />
      {report.rows.length ? <ReportContractTable rows={report.rows} /> : null}
    </>
  );
}
