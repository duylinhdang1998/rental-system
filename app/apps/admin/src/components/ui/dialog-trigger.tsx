import type { ComponentProps } from 'react';
import { Dialog as DialogPrimitive } from 'radix-ui';

export function DialogTrigger(props: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}
