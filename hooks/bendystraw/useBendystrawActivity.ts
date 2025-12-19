import { useQuery } from '@tanstack/react-query';
import type { BendystrawActivityEvent, BendystrawActivityQueryParams } from '@/lib/bendystraw';
import { fetchActivityEvents } from '@/lib/bendystraw';
import { queryKeys } from '@/lib/query';

interface UseBendystrawActivityResult {
  activityEvents: BendystrawActivityEvent[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBendystrawActivity(
  params: BendystrawActivityQueryParams | null
): UseBendystrawActivityResult {
  const query = useQuery({
    queryKey: queryKeys.bendystraw.activity(
      params?.projectId,
      params?.chainId,
      params?.type,
      params?.limit
    ),
    queryFn: async () => {
      if (!params) {
        throw new Error('Params are required');
      }
      return fetchActivityEvents(params);
    },
    enabled: !!params,
    staleTime: 30_000,
  });

  return {
    activityEvents: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
