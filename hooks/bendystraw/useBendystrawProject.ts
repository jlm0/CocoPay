import { useQuery } from '@tanstack/react-query';
import type { BendystrawProject } from '@/lib/bendystraw';
import { fetchProject } from '@/lib/bendystraw';
import { queryKeys } from '@/lib/query';

interface UseBendystrawProjectResult {
  project: BendystrawProject | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBendystrawProject(
  projectId: number | null,
  chainId: number
): UseBendystrawProjectResult {
  const query = useQuery({
    queryKey: queryKeys.bendystraw.project(projectId, chainId),
    queryFn: async () => {
      if (projectId === null) {
        throw new Error('Project ID is required');
      }
      return fetchProject(projectId, chainId);
    },
    enabled: projectId !== null,
    staleTime: 30_000,
  });

  return {
    project: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
