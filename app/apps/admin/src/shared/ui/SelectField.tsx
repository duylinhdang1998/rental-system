import { Field } from '@/components/ui/field';
import { FieldLabel } from '@/components/ui/field-label';
import { SelectContent } from '@/components/ui/select-content';
import { SelectItem } from '@/components/ui/select-item';
import { Select } from '@/components/ui/select-root';
import { SelectTrigger } from '@/components/ui/select-trigger';
import { SelectValue } from '@/components/ui/select-value';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  id: string;
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  value: string;
}

const EMPTY_VALUE = '__all__';

export function SelectField({ id, label, onChange, options, value }: SelectFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        onValueChange={(next) => onChange(next === EMPTY_VALUE ? '' : next)}
        value={value || EMPTY_VALUE}
      >
        <SelectTrigger className="w-full" id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value || EMPTY_VALUE} value={option.value || EMPTY_VALUE}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
