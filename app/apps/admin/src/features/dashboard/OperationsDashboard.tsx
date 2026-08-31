import { DashboardHeader } from './DashboardHeader';
import { FleetStatus } from './FleetStatus';
import { KpiGrid } from './KpiGrid';
import { PriorityWorkList } from './PriorityWorkList';
import { TodaySchedule } from './TodaySchedule';
import { ViewState } from '../../shared/ui/ViewState';
import { useDashboard } from './use-dashboard';

export function OperationsDashboard() {
  const dashboard = useDashboard();
  if (dashboard.isPending) return <ViewState state="loading" />;
  if (dashboard.isError)
    return <ViewState onRetry={() => void dashboard.refetch()} state="error" />;
  if (dashboard.data.overdue + dashboard.data.dueToday === 0) return <ViewState state="empty" />;
  return (
    <div className="grid gap-5 lg:gap-6">
      <DashboardHeader />
      <KpiGrid dashboard={dashboard.data} />
      <div className="grid gap-5 xl:grid-cols-2">
        <PriorityWorkList />
        <FleetStatus />
      </div>
      <TodaySchedule />
    </div>
  );
}
