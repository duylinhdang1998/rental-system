import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function TableHead({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground',
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  );
}
