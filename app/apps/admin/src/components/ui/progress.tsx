import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

function Progress({ className, ...props }: ComponentProps<'progress'>) {
  return <progress className={cn('progress-track', className)} data-slot="progress" {...props} />;
}

export { Progress };
