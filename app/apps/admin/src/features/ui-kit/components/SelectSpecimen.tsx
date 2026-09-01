import { Field } from '@/components/ui/field';
import { FieldLabel } from '@/components/ui/field-label';
import { SelectContent } from '@/components/ui/select-content';
import { SelectGroup } from '@/components/ui/select-group';
import { SelectItem } from '@/components/ui/select-item';
import { Select } from '@/components/ui/select-root';
import { SelectTrigger } from '@/components/ui/select-trigger';
import { SelectValue } from '@/components/ui/select-value';

export function SelectSpecimen() {
  return (
    <Field>
      <FieldLabel htmlFor="vehicle-type">Loại xe</FieldLabel>
      <Select defaultValue="scooter">
        <SelectTrigger id="vehicle-type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="scooter">Xe tay ga</SelectItem>
            <SelectItem value="manual">Xe số</SelectItem>
            <SelectItem value="sport">Xe côn tay</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
