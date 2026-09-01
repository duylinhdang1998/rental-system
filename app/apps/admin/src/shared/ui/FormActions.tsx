import { LoadingButton } from '@/shared/ui/LoadingButton';
import { Button as ShadcnButton } from '@/components/ui/button';

interface FormActionsProps {
  cancelLabel: string;
  loading: boolean;
  onCancel: () => void;
  saveLabel: string;
}

export function FormActions({ cancelLabel, loading, onCancel, saveLabel }: FormActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      <ShadcnButton onClick={onCancel} type="button" variant="outline">
        {cancelLabel}
      </ShadcnButton>
      <LoadingButton loading={loading} type="submit">
        {saveLabel}
      </LoadingButton>
    </div>
  );
}
