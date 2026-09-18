import type { CashShiftExpectation } from '@rental/contracts';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { CloseShiftFields } from '@/features/cash-shifts/components/dialogs/CloseShiftFields';
import { useCashShiftForm } from '@/features/cash-shifts/hooks/use-cash-shift-form';
import { useCloseCashShift } from '@/features/cash-shifts/hooks/use-cash-shifts';
import {
  INITIAL_CLOSE_FORM,
  closeBlocked,
  toCloseInput,
} from '@/features/cash-shifts/lib/cash-shift-presentation';

interface CloseShiftDialogProps {
  expectation: CashShiftExpectation;
  onClose: () => void;
  shiftId: string;
}

const COPY_KEYS = {
  description: 'cashShiftCloseBody',
  save: 'cashShiftConfirmClose',
  title: 'cashShiftClose',
};

export function CloseShiftDialog({ expectation, onClose, shiftId }: CloseShiftDialogProps) {
  const mutation = useCloseCashShift(shiftId);
  const form = useCashShiftForm(INITIAL_CLOSE_FORM, toCloseInput, mutation, onClose);
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
      submitDisabled={closeBlocked(form.form, expectation)}
    >
      <CloseShiftFields expectation={expectation} form={form.form} onChange={form.change} />
    </LifecycleFormDialog>
  );
}
