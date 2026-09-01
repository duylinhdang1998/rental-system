import { Field } from '@/components/ui/field';
import { FieldLabel } from '@/components/ui/field-label';
import { RadioGroupItem } from '@/components/ui/radio-group-item';
import { RadioGroup } from '@/components/ui/radio-group-root';

export function RadioSpecimen() {
  return (
    <Field>
      <FieldLabel className="font-bold">Thanh toán</FieldLabel>
      <RadioGroup defaultValue="cash">
        <Field orientation="horizontal">
          <RadioGroupItem id="cash" value="cash" />
          <FieldLabel htmlFor="cash">Tiền mặt</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <RadioGroupItem id="transfer" value="transfer" />
          <FieldLabel htmlFor="transfer">Chuyển khoản</FieldLabel>
        </Field>
      </RadioGroup>
    </Field>
  );
}
