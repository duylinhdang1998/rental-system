import { ReportExportButton } from '@/features/reporting/components/filters/ReportExportButton';
import { ReportRangeForm } from '@/features/reporting/components/filters/ReportRangeForm';
import { ReportBody } from '@/features/reporting/components/layout/ReportBody';
import { ReportTabs } from '@/features/reporting/components/layout/ReportTabs';
import { ReportHeader } from '@/features/reporting/components/summary/ReportHeader';
import { useReportPage } from '@/features/reporting/hooks/use-report-page';

export function ReportPage() {
  const page = useReportPage();
  return (
    <section className="grid gap-5">
      <ReportHeader generatedAt={page.report.data?.generatedAt} />
      <ReportTabs active="revenue" />
      <div className="surface-card flex flex-wrap items-end justify-between gap-4 p-4">
        <ReportRangeForm issue={page.issue} onChange={page.setField} range={page.range} />
        <ReportExportButton disabled={page.issue !== null} href={page.exportUrl} />
      </div>
      <ReportBody issue={page.issue} report={page.report} />
    </section>
  );
}
