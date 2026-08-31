import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { DemoPreview, PreviewModule } from '@rental/contracts';
import { fetchPreview } from '../api/demo-api';

export function usePreview(moduleName: PreviewModule): UseQueryResult<DemoPreview, Error> {
  return useQuery({
    queryFn: () => fetchPreview(moduleName),
    queryKey: ['demo-preview', moduleName],
  });
}
