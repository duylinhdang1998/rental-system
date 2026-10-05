import { DashboardHeader } from '@/features/dashboard/components/DashboardHeader';
import { DashboardContent } from '@/features/dashboard/components/DashboardContent';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { QueryRegion } from '@/shared/ui/QueryRegion';
import { useDashboard } from '@/features/dashboard/hooks/use-dashboard';

const ERROR_COPY = { description: 'errorBody', title: 'errorTitle' };

export function OperationsDashboard() {
  const dashboard = useDashboard();
  return (
    <div className="grid gap-5 lg:gap-6">
      <DashboardHeader generatedAt={dashboard.data?.generatedAt} />
      <QueryRegion errorCopy={ERROR_COPY} query={dashboard} skeleton={<DashboardSkeleton />}>
        {(board) => <DashboardContent board={board} />}
      </QueryRegion>
    </div>
  );
}
