import type { RevenueReport } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ReportMoneyTable } from '@/features/reporting/components/tables/ReportMoneyTable';
import {
  dailyMoneyRows,
  employeeMoneyRows,
  maxDailyNet,
} from '@/features/reporting/lib/report-presentation';
import { resolveInitialLocale } from '@/shared/i18n/locale';

interface ReportMoneyTablesProps {
  report: RevenueReport;
}

export function ReportMoneyTables({ report }: ReportMoneyTablesProps) {
  const { i18n } = useTranslation();
  const locale = resolveInitialLocale(i18n.language);
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ReportMoneyTable
        id="days"
        labelKey="reportDay"
        max={maxDailyNet(report.days)}
        rows={dailyMoneyRows(report.days, locale)}
        titleKey="reportDaily"
      />
      <ReportMoneyTable
        id="employees"
        labelKey="reportEmployee"
        rows={employeeMoneyRows(report.employees, locale)}
        titleKey="reportEmployees"
      />
    </div>
  );
}
