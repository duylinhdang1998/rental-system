import { MAX_ANALYTICS_DAYS } from '@rental/contracts';
import { AnalyticsBody } from '@/features/reporting/components/analytics/AnalyticsBody';
import { AnalyticsHeader } from '@/features/reporting/components/analytics/AnalyticsHeader';
import { ReportExportButton } from '@/features/reporting/components/filters/ReportExportButton';
import { ReportRangeForm } from '@/features/reporting/components/filters/ReportRangeForm';
import { ReportTabs } from '@/features/reporting/components/layout/ReportTabs';
import { useAnalyticsPage } from '@/features/reporting/hooks/use-analytics-page';

export function AnalyticsPage() {
  const page = useAnalyticsPage();
  return (
    <section className="grid gap-5">
      <AnalyticsHeader
        generatedAt={page.report.data?.generatedAt}
        subtitleKey="analyticsSubtitle"
        titleKey="analyticsTitle"
      />
      <ReportTabs active="analytics" />
      <div className="surface-card flex flex-wrap items-end justify-between gap-4 p-4">
        <ReportRangeForm
          issue={page.issue}
          maxDays={MAX_ANALYTICS_DAYS}
          onChange={page.setField}
          range={page.range}
        />
        <ReportExportButton disabled={page.issue !== null} href={page.exportUrl} />
      </div>
      <AnalyticsBody issue={page.issue} report={page.report} />
    </section>
  );
}
