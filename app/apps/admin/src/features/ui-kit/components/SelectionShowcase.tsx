import { CheckboxSpecimen } from '@/features/ui-kit/components/CheckboxSpecimen';
import { RadioSpecimen } from '@/features/ui-kit/components/RadioSpecimen';
import { SelectSpecimen } from '@/features/ui-kit/components/SelectSpecimen';

export function SelectionShowcase() {
  return (
    <div className="grid gap-7 md:grid-cols-3">
      <SelectSpecimen />
      <CheckboxSpecimen />
      <RadioSpecimen />
    </div>
  );
}
