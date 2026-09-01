import { DashboardHeader } from '../components/DashboardHeader';
import { FleetStatus } from '../components/FleetStatus';
import { KpiGrid } from '../components/KpiGrid';
import { PriorityWorkList } from '../components/PriorityWorkList';
import { TodaySchedule } from '../components/TodaySchedule';
import { ViewState } from '../../../shared/ui/ViewState';
import { useDashboard } from '../hooks/use-dashboard';

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
