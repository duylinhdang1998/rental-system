import type { ComponentProps } from 'react';
import { Select as SelectPrimitive } from 'radix-ui';

export function SelectGroup(props: ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}
