import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { FieldLabel } from '@/components/ui/field-label';

interface CheckboxFieldProps {
  checked?: boolean;
  className?: string;
  disabled?: boolean;
  id: string;
  label: string;
  onChange?: (checked: boolean) => void;
  required?: boolean;
}

export function CheckboxField({
  checked,
  className,
  disabled,
  id,
  label,
  onChange,
  required,
}: CheckboxFieldProps) {
  return (
    <Field className={className} orientation="horizontal">
      <Checkbox
        aria-required={required}
        checked={checked}
        disabled={disabled}
        id={id}
        onCheckedChange={(value) => onChange?.(value === true)}
      />
      <FieldLabel className="cursor-pointer" htmlFor={id}>
        {label}
      </FieldLabel>
    </Field>
  );
}
