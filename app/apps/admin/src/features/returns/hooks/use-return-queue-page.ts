import { useState } from 'react';
import type { ReturnTarget } from '@/features/contracts';
import { useReturnQueue } from '@/features/returns/hooks/use-return-queue';

export interface QueueSelection {
  contractId: string;
  target: ReturnTarget;
}

export function useReturnQueuePage() {
  const queue = useReturnQueue();
  const [selection, setSelection] = useState<QueueSelection | null>(null);
  return {
    clear: () => setSelection(null),
    queue,
    select: setSelection,
    selection,
  };
}
