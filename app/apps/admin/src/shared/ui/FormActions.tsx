import { Button } from './Button';

interface FormActionsProps {
  cancelLabel: string;
  loading: boolean;
  onCancel: () => void;
  saveLabel: string;
}

export function FormActions({ cancelLabel, loading, onCancel, saveLabel }: FormActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-3">
      <button
        className="button-base border border-line bg-panel text-ink"
        onClick={onCancel}
        type="button"
      >
        {cancelLabel}
      </button>
      <Button loading={loading} type="submit">
        {saveLabel}
      </Button>
    </div>
  );
}
