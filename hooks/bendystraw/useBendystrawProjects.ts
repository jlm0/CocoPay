import { useQuery } from '@tanstack/react-query';
import type { BendystrawProject, BendystrawProjectsQueryParams } from '@/lib/bendystraw';
import { fetchProjects } from '@/lib/bendystraw';

interface UseBendystrawProjectsResult {
  projects: BendystrawProject[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBendystrawProjects(
  params: BendystrawProjectsQueryParams = {}
): UseBendystrawProjectsResult {
  const query = useQuery({
    queryKey: [
      'bendystraw',
      'projects',
      params.where?.owner,
      params.where?.chainId,
      params.orderBy,
      params.limit,
    ],
    queryFn: async () => {
      console.log('[useBendystrawProjects] Fetching projects with params:', params);
      try {
        const result = await fetchProjects(params);
        console.log('[useBendystrawProjects] Projects result:', {
          totalCount: result.totalCount,
          itemCount: result.items.length,
          projectIds: result.items.map((p) => p.projectId),
        });
        return result;
      } catch (err) {
        console.error('[useBendystrawProjects] Fetch error:', err);
        throw err;
      }
    },
    staleTime: 30_000,
  });

  if (query.error) {
    console.error('[useBendystrawProjects] Query error state:', query.error);
  }

  return {
    projects: query.data?.items ?? [],
    totalCount: query.data?.totalCount ?? 0,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
