import { EconomicsAsOfForm } from '@/features/reporting/components/economics/EconomicsAsOfForm';
import { EconomicsBody } from '@/features/reporting/components/economics/EconomicsBody';
import { EconomicsHeader } from '@/features/reporting/components/economics/EconomicsHeader';
import { ReportExportButton } from '@/features/reporting/components/filters/ReportExportButton';
import { ReportTabs } from '@/features/reporting/components/layout/ReportTabs';
import { useFleetEconomicsPage } from '@/features/reporting/hooks/use-fleet-economics-page';

export function FleetEconomicsPage() {
  const page = useFleetEconomicsPage();
  return (
    <section className="grid gap-5">
      <EconomicsHeader generatedAt={page.report.data?.generatedAt} />
      <ReportTabs active="fleet" />
      <div className="surface-card flex flex-wrap items-end justify-between gap-4 p-4">
        <EconomicsAsOfForm asOf={page.asOf} issue={page.issue} onChange={page.setAsOf} />
        <ReportExportButton disabled={page.issue !== null} href={page.exportUrl} />
      </div>
      <EconomicsBody issue={page.issue} report={page.report} />
    </section>
  );
}
