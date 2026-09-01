import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  return <thead className={cn('[&_tr]:border-b', className)} data-slot="table-header" {...props} />;
}
