import { useQueryClient } from '@tanstack/react-query';
import { prefetchRoute } from '@/routes/route-prefetch';

export function useNavigationPrefetch() {
  const client = useQueryClient();
  return (path: string) => {
    void prefetchRoute(client, path).catch(() => undefined);
  };
}
