import { useQuery } from '@tanstack/react-query';
import { ISO_DATE_LENGTH, MILLISECONDS_PER_DAY } from '@rental/contracts';
import { fetchCalendar } from './fleet-api';

const RANGE_DAYS = 6;

function dateAfter(date: string, days: number): string {
  const timestamp = Date.parse(`${date}T00:00:00.000Z`) + days * MILLISECONDS_PER_DAY;
  return new Date(timestamp).toISOString().slice(0, ISO_DATE_LENGTH);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, ISO_DATE_LENGTH);
}

export function useFleetCalendar(from: string, typeCode?: string) {
  const to = dateAfter(from, RANGE_DAYS);
  const query = useQuery({
    queryFn: () => fetchCalendar(from, to, typeCode),
    queryKey: ['fleet-calendar', from, to, typeCode],
  });
  return { ...query, to };
}

export function moveCalendar(from: string, direction: -1 | 1): string {
  return dateAfter(from, direction * (RANGE_DAYS + 1));
}
