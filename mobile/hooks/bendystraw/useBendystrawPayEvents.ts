import { useQuery } from '@tanstack/react-query';
import type { BendystrawPayEvent, BendystrawPayEventsQueryParams } from '@/lib/bendystraw';
import { fetchPayEvents } from '@/lib/bendystraw';
import { queryKeys } from '@/lib/query';

interface UseBendystrawPayEventsResult {
  payEvents: BendystrawPayEvent[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBendystrawPayEvents(
  params: BendystrawPayEventsQueryParams | null
): UseBendystrawPayEventsResult {
  const query = useQuery({
    queryKey: queryKeys.bendystraw.payEvents(params?.projectId, params?.chainId, params?.limit),
    queryFn: async () => {
      if (!params) {
        throw new Error('Params are required');
      }
      return fetchPayEvents(params);
    },
    enabled: !!params,
    staleTime: 30_000,
  });

  return {
    payEvents: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
