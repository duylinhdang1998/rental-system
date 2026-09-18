import type { CashShift } from '@rental/contracts';
import { CashShiftWorkspace } from '@/features/cash-shifts/components/CashShiftWorkspace';
import { useCashShiftPage } from '@/features/cash-shifts/hooks/use-cash-shift-page';
import { ViewState } from '@/shared/ui/ViewState';

function closedShifts(items: CashShift[]): CashShift[] {
  return items.filter((item) => item.status === 'CLOSED');
}

export function CashShiftPage() {
  const page = useCashShiftPage();
  if (page.current.isPending || page.history.isPending) return <ViewState state="loading" />;
  if (page.current.isError || page.history.isError) {
    return (
      <ViewState
        onRetry={() => {
          void page.current.refetch();
          void page.history.refetch();
        }}
        state="error"
      />
    );
  }
  return (
    <CashShiftWorkspace
      current={page.current.data}
      dialog={page.dialog}
      historyItems={closedShifts(page.history.data.items)}
      onCloseDialog={page.closeDialog}
      onOpenCloseDialog={page.openCloseDialog}
      onOpenOpenDialog={page.openOpenDialog}
    />
  );
}
