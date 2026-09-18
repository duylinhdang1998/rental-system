import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** Wide tables scroll sideways on phones, so the region must be reachable from the keyboard. */
const SCROLL_REGION_TAB_INDEX = 0;

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div
      className="relative w-full overflow-x-auto"
      data-slot="table-container"
      role="region"
      tabIndex={SCROLL_REGION_TAB_INDEX}
    >
      <table
        className={cn('w-full caption-bottom text-sm', className)}
        data-slot="table"
        {...props}
      />
    </div>
  );
}
