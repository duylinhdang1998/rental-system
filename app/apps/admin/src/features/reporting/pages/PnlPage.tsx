import { AnalyticsHeader } from '@/features/reporting/components/analytics/AnalyticsHeader';
import { ReportExportButton } from '@/features/reporting/components/filters/ReportExportButton';
import { ReportTabs } from '@/features/reporting/components/layout/ReportTabs';
import { PnlBody } from '@/features/reporting/components/pnl/PnlBody';
import { PnlForm } from '@/features/reporting/components/pnl/PnlForm';
import { usePnlPage } from '@/features/reporting/hooks/use-pnl-page';

export function PnlPage() {
  const page = usePnlPage();
  return (
    <section className="grid gap-5">
      <AnalyticsHeader
        generatedAt={page.report.data?.generatedAt}
        subtitleKey="pnlSubtitle"
        titleKey="pnlTitle"
      />
      <ReportTabs active="pnl" />
      <div className="surface-card flex flex-wrap items-end justify-between gap-4 p-4">
        <PnlForm issue={page.issue} onChange={page.setField} query={page.query} />
        <ReportExportButton disabled={page.issue !== null} href={page.exportUrl} />
      </div>
      <PnlBody issue={page.issue} report={page.report} />
    </section>
  );
}
