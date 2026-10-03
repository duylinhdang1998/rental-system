import { useState } from 'react';
import { resolvePrimaryColor, savePrimaryColor } from '@/shared/theme/primary-color';

export function usePrimaryColor() {
  const [color, setColor] = useState(() =>
    resolvePrimaryColor(document.documentElement.dataset.primaryColor ?? null),
  );
  const selectColor = (id: string) => {
    const next = resolvePrimaryColor(id);
    savePrimaryColor(next);
    setColor(next);
  };
  return { color, selectColor };
}
