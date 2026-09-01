import { Checkbox } from '@/components/ui/checkbox';
import { Field } from '@/components/ui/field';
import { FieldLabel } from '@/components/ui/field-label';

export function CheckboxSpecimen() {
  return (
    <Field className="content-start">
      <FieldLabel className="font-bold">Tùy chọn</FieldLabel>
      <Field orientation="horizontal">
        <Checkbox defaultChecked id="helmet" />
        <FieldLabel htmlFor="helmet">Kèm mũ bảo hiểm</FieldLabel>
      </Field>
      <Field orientation="horizontal">
        <Checkbox disabled id="insurance" />
        <FieldLabel htmlFor="insurance">Bảo hiểm mở rộng</FieldLabel>
      </Field>
    </Field>
  );
}
