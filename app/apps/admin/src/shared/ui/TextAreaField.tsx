import type { TextareaHTMLAttributes } from 'react';
import { Field } from '@/components/ui/field';
import { FieldLabel } from '@/components/ui/field-label';
import { Textarea } from '@/components/ui/textarea';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function TextAreaField({ id, label, ...props }: TextAreaFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Textarea id={id} {...props} />
    </Field>
  );
}
