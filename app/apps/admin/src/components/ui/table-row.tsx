import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  );
}
