import { useQuery } from '@tanstack/react-query';

export function useDemoMode(): boolean {
  const health = useQuery({
    queryKey: ['health', 'demo-mode'],
    queryFn: async () => {
      const response = await fetch('/api/health/ready');
      if (!response.ok) return false;
      const body: unknown = await response.json();
      return (
        typeof body === 'object' &&
        body !== null &&
        'checks' in body &&
        typeof body.checks === 'object' &&
        body.checks !== null &&
        'database' in body.checks &&
        body.checks.database === 'demo'
      );
    },
    retry: false,
    staleTime: Infinity,
  });
  return health.data === true;
}
