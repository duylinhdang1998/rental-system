import { LoadingButton, type ButtonVariant } from '@/shared/ui/LoadingButton';
import { Button as ShadcnButton } from '@/components/ui/button';

interface FormActionsProps {
  cancelLabel: string;
  disabled?: boolean;
  loading: boolean;
  onCancel: () => void;
  saveLabel: string;
  saveVariant?: ButtonVariant;
}

export function FormActions(props: FormActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      <ShadcnButton onClick={props.onCancel} type="button" variant="outline">
        {props.cancelLabel}
      </ShadcnButton>
      <LoadingButton
        disabled={props.disabled}
        loading={props.loading}
        type="submit"
        variant={props.saveVariant}
      >
        {props.saveLabel}
      </LoadingButton>
    </div>
  );
}
