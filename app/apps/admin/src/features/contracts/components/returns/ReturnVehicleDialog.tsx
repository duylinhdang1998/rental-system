import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { NotesField } from '@/features/contracts/components/lifecycle/NotesField';
import { ReturnChargeFields } from '@/features/contracts/components/returns/ReturnChargeFields';
import { ReturnInspectionFields } from '@/features/contracts/components/returns/ReturnInspectionFields';
import { ReturnPhotoField } from '@/features/contracts/components/returns/ReturnPhotoField';
import { ReturnTimeFields } from '@/features/contracts/components/returns/ReturnTimeFields';
import { useLifecycleForm } from '@/features/contracts/hooks/use-lifecycle-form';
import { useReturnVehicle } from '@/features/contracts/hooks/use-return-vehicle';
import {
  initialReturnForm,
  photoIssue,
  toReturnSubmission,
  type ReturnTarget,
} from '@/features/contracts/lib/return-form';

interface ReturnVehicleDialogProps {
  contractId: string;
  onClose: () => void;
  target: ReturnTarget;
}

const COPY_KEYS = {
  description: 'returnVehicleBody',
  save: 'returnVehicleConfirm',
  title: 'returnVehicle',
};

/** US-016: receive one vehicle; shared by the contract detail page and the return queue. */
export function ReturnVehicleDialog({ contractId, onClose, target }: ReturnVehicleDialogProps) {
  const mutation = useReturnVehicle(contractId, target.id);
  const form = useLifecycleForm(initialReturnForm(), toReturnSubmission, mutation, onClose);
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
      submitDisabled={photoIssue(form.form.photos) !== null}
    >
      <ReturnTimeFields onChange={form.change} target={target} values={form.form} />
      <ReturnInspectionFields onChange={form.change} values={form.form} />
      <ReturnPhotoField
        onChange={(photos) => form.change('photos', photos)}
        photos={form.form.photos}
      />
      <NotesField
        id="return-notes"
        labelKey="returnNotes"
        onChange={(value) => form.change('notes', value)}
        value={form.form.notes}
      />
      <ReturnChargeFields onChange={form.change} values={form.form} />
    </LifecycleFormDialog>
  );
}
