import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  return (
    <tr
      className={cn(
        'border-b border-line transition-colors hover:bg-muted data-[state=selected]:bg-muted',
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  );
}
