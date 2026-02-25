import { useQuery } from '@tanstack/react-query';
import type { BendystrawParticipant, BendystrawParticipantsQueryParams } from '@/lib/bendystraw';
import { fetchParticipants } from '@/lib/bendystraw';
import { queryKeys } from '@/lib/query';

interface UseBendystrawParticipantsResult {
  participants: BendystrawParticipant[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBendystrawParticipants(
  params: BendystrawParticipantsQueryParams | null
): UseBendystrawParticipantsResult {
  const query = useQuery({
    queryKey: queryKeys.bendystraw.participants(
      params?.projectId,
      params?.chainId,
      params?.orderBy,
      params?.limit
    ),
    queryFn: async () => {
      if (!params) {
        throw new Error('Params are required');
      }
      return fetchParticipants(params);
    },
    enabled: !!params,
    staleTime: 30_000,
  });

  return {
    participants: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
