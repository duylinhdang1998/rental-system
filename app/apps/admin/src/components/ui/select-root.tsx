import type { ComponentProps } from 'react';
import { Select as SelectPrimitive } from 'radix-ui';

export function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}
