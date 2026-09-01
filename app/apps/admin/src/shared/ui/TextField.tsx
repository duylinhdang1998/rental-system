import type { InputHTMLAttributes } from 'react';
import { Field } from '@/components/ui/field';
import { FieldError } from '@/components/ui/field-error';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

export function TextField({ error, id, label, ...props }: TextFieldProps) {
  const errorId = `${id}-error`;
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        id={id}
        {...props}
      />
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  );
}
