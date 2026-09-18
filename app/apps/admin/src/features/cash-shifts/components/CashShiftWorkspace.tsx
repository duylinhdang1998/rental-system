import type { CashShift, CashShiftCurrent } from '@rental/contracts';
import { CashShiftHeader } from '@/features/cash-shifts/components/CashShiftHeader';
import { CurrentShiftCard } from '@/features/cash-shifts/components/current/CurrentShiftCard';
import { CashShiftDialogs } from '@/features/cash-shifts/components/dialogs/CashShiftDialogs';
import { ShiftHistoryList } from '@/features/cash-shifts/components/history/ShiftHistoryList';
import type { CashShiftDialogKind } from '@/features/cash-shifts/hooks/use-cash-shift-page';

interface CashShiftWorkspaceProps {
  current: CashShiftCurrent;
  dialog: CashShiftDialogKind;
  historyItems: CashShift[];
  onCloseDialog: () => void;
  onOpenCloseDialog: () => void;
  onOpenOpenDialog: () => void;
}

export function CashShiftWorkspace(props: CashShiftWorkspaceProps) {
  const { current, dialog, historyItems, onCloseDialog, onOpenCloseDialog, onOpenOpenDialog } =
    props;
  return (
    <section className="grid gap-5">
      <CashShiftHeader hasOpenShift={Boolean(current.shift)} onOpenShift={onOpenOpenDialog} />
      <CurrentShiftCard
        current={current}
        onCloseShift={onOpenCloseDialog}
        onOpenShift={onOpenOpenDialog}
      />
      <ShiftHistoryList items={historyItems} />
      <CashShiftDialogs current={current} dialog={dialog} onClose={onCloseDialog} />
    </section>
  );
}
