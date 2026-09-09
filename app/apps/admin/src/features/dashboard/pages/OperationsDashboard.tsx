import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { FleetStatus } from '@/features/dashboard/components/FleetStatus';
import { KpiGrid } from '@/features/dashboard/components/KpiGrid';
import { PriorityWorkList } from '@/features/dashboard/components/PriorityWorkList';
import { TodaySchedule } from '@/features/dashboard/components/TodaySchedule';
import { ViewState } from '@/shared/ui/ViewState';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';

export function OperationsDashboard() {
  const dashboard = useDashboard();
  if (dashboard.isPending) return <ViewState state="loading" />;
  if (dashboard.isError)
    return <ViewState onRetry={() => void dashboard.refetch()} state="error" />;
  const board = dashboard.data;
  return (
    <div className="grid gap-5 lg:gap-6">
      <DashboardHeader generatedAt={board.generatedAt} />
      <KpiGrid board={board} />
      <div className="grid gap-5 xl:grid-cols-2">
        {board.items.length ? (
          <PriorityWorkList items={board.items} />
        ) : (
          <ViewState heading="section" state="empty" />
        )}
        <FleetStatus fleet={board.fleet} />
      </div>
      {board.items.length ? <TodaySchedule items={board.items} /> : null}
    </div>
  );
}
