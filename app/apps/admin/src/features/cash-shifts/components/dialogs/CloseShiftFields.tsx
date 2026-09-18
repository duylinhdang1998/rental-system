import type { CashShiftExpectation } from '@rental/contracts';
import { CloseShiftAmountField } from '@/features/cash-shifts/components/dialogs/CloseShiftAmountField';
import { CloseShiftExpectedLine } from '@/features/cash-shifts/components/dialogs/CloseShiftExpectedLine';
import { CloseShiftNoteField } from '@/features/cash-shifts/components/dialogs/CloseShiftNoteField';
import { CloseShiftVariancePreview } from '@/features/cash-shifts/components/dialogs/CloseShiftVariancePreview';
import {
  previewVariance,
  type CloseShiftFormValues,
} from '@/features/cash-shifts/lib/cash-shift-presentation';

interface CloseShiftFieldsProps {
  expectation: CashShiftExpectation;
  form: CloseShiftFormValues;
  onChange: <TField extends keyof CloseShiftFormValues>(
    field: TField,
    value: CloseShiftFormValues[TField],
  ) => void;
}

export function CloseShiftFields({ expectation, form, onChange }: CloseShiftFieldsProps) {
  const variance = previewVariance(form, expectation);
  return (
    <div className="grid gap-4">
      <CloseShiftExpectedLine expectation={expectation} />
      <CloseShiftAmountField
        onChange={(value) => onChange('countedCashVnd', value)}
        value={form.countedCashVnd}
      />
      {variance === null ? null : <CloseShiftVariancePreview varianceVnd={variance} />}
      <CloseShiftNoteField onChange={(value) => onChange('note', value)} value={form.note} />
    </div>
  );
}
