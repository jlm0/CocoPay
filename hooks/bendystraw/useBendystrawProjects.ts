import { useQuery } from '@tanstack/react-query';
import type { BendystrawProject, BendystrawProjectsQueryParams } from '@/lib/bendystraw';
import { fetchProjects } from '@/lib/bendystraw';
import { queryKeys } from '@/lib/query';

interface UseBendystrawProjectsResult {
  projects: BendystrawProject[];
  totalCount: number;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBendystrawProjects(
  params: BendystrawProjectsQueryParams = {}
): UseBendystrawProjectsResult {
  const query = useQuery({
    queryKey: queryKeys.bendystraw.projects(
      params.where?.owner,
      params.where?.chainId,
      params.orderBy,
      params.limit
    ),
    queryFn: () => fetchProjects(params),
    staleTime: 30_000,
  });

  return {
    projects: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
