import { useQuery } from '@tanstack/react-query';
import type { BendystrawProject } from '@/lib/bendystraw';
import { fetchProject } from '@/lib/bendystraw';

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
    queryKey: ['bendystraw', 'project', projectId, chainId],
    queryFn: async () => {
      if (projectId === null) {
        throw new Error('Project ID is required');
      }
      console.log(`[useBendystrawProject] Fetching project ${projectId} on chain ${chainId}...`);
      const result = await fetchProject(projectId, chainId);
      console.log(`[useBendystrawProject] Project ${projectId} result:`, {
        found: !!result,
        owner: result?.owner,
        metadataUri: result?.metadataUri,
        tokenSupply: result?.tokenSupply,
      });
      return result;
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
