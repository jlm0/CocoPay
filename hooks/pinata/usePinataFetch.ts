import { useQuery } from '@tanstack/react-query';
import { fetchByCid, type FetchResponse } from '@/lib/pinata';

interface UsePinataFetchResult<T = unknown> {
  data: FetchResponse<T> | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePinataFetch(cid: string | null): UsePinataFetchResult {
  const query = useQuery({
    queryKey: ['pinata', 'fetch', cid],
    queryFn: async () => {
      if (!cid) {
        throw new Error('CID is required');
      }
      return fetchByCid(cid);
    },
    enabled: !!cid,
    staleTime: 60_000,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
