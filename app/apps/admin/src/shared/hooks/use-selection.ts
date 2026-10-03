import { useState } from 'react';

export function useSelection<T>() {
  const [selected, select] = useState<T | null>(null);
  return { selected, select, clear: () => select(null) };
}
