import { useQuery } from '@tanstack/react-query';
import {
  fetchMetadataFromIPFS,
  extractCidFromUri,
  type ProjectMetadata,
} from '@/lib/juicebox/metadata';
import { queryKeys } from '@/lib/query';

interface UseProjectMetadataResult {
  metadata: ProjectMetadata | null;
  isLoading: boolean;
  error: Error | null;
}

export function useProjectMetadata(
  metadataUri: string | null | undefined
): UseProjectMetadataResult {
  const cid = metadataUri ? extractCidFromUri(metadataUri) : null;

  const query = useQuery({
    queryKey: queryKeys.projectMetadata.byCid(cid),
    queryFn: async () => {
      if (!cid) {
        throw new Error('No CID available');
      }
      return fetchMetadataFromIPFS(cid);
    },
    enabled: !!cid,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
  });

  return {
    metadata: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
