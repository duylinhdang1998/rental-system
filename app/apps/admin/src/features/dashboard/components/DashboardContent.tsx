import type { OperationsBoard } from '@rental/contracts';
import { FleetStatus } from '@/features/dashboard/components/FleetStatus';
import { KpiGrid } from '@/features/dashboard/components/KpiGrid';
import { PriorityWorkList } from '@/features/dashboard/components/PriorityWorkList';
import { TodaySchedule } from '@/features/dashboard/components/TodaySchedule';
import { ViewState } from '@/shared/ui/ViewState';

export function DashboardContent({ board }: { board: OperationsBoard }) {
  return (
    <div className="grid gap-5 lg:gap-6">
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
