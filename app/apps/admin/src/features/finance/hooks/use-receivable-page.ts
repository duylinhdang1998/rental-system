import { useState } from 'react';
import type { ReceivableItem } from '@rental/contracts';
import { useReceivables } from '@/features/finance/hooks/use-receivables';

export function useReceivablePage() {
  const receivables = useReceivables();
  const [selection, setSelection] = useState<ReceivableItem | null>(null);
  return {
    clear: () => setSelection(null),
    receivables,
    select: setSelection,
    selection,
  };
}
