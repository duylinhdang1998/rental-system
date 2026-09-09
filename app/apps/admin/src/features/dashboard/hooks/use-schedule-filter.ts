import { useState } from 'react';
import type { ScheduleFilter } from '@/features/dashboard/lib/board-presentation';

export function useScheduleFilter() {
  const [filter, setFilter] = useState<ScheduleFilter>('ALL');
  return { filter, setFilter };
}
