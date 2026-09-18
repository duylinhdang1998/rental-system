import type { CashShiftCurrent } from '@rental/contracts';
import { CloseShiftDialog } from '@/features/cash-shifts/components/dialogs/CloseShiftDialog';
import { OpenShiftDialog } from '@/features/cash-shifts/components/dialogs/OpenShiftDialog';
import type { CashShiftDialogKind } from '@/features/cash-shifts/hooks/use-cash-shift-page';

interface CashShiftDialogsProps {
  current: CashShiftCurrent;
  dialog: CashShiftDialogKind;
  onClose: () => void;
}

export function CashShiftDialogs({ current, dialog, onClose }: CashShiftDialogsProps) {
  if (dialog === 'open') return <OpenShiftDialog onClose={onClose} />;
  if (dialog === 'close' && current.shift && current.expectation) {
    return (
      <CloseShiftDialog
        expectation={current.expectation}
        onClose={onClose}
        shiftId={current.shift.id}
      />
    );
  }
  return null;
}
