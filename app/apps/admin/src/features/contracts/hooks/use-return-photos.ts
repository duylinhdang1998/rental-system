import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchReturnPhotos } from '@/features/contracts/api/contracts-api';

/** Signed links live 300 s, so the list is refetched on every mount rather than cached. */
export function useReturnPhotos(lineId: string, enabled: boolean) {
  const { id = '' } = useParams();
  return useQuery({
    enabled: enabled && id !== '',
    queryFn: () => fetchReturnPhotos(id, lineId),
    queryKey: ['return-photos', id, lineId],
    staleTime: 0,
  });
}
