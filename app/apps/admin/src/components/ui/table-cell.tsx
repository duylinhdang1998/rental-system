import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function TableCell({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      className={cn('p-2 align-middle whitespace-nowrap', className)}
      data-slot="table-cell"
      {...props}
    />
  );
}
