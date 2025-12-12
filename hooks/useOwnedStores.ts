import { useMemo } from 'react';
import type { Address } from 'viem';
import { useQueries } from '@tanstack/react-query';
import { useBendystrawProjects } from '@/hooks/bendystraw';
import { fetchMetadataFromIPFS, extractCidFromUri } from '@/lib/juicebox/metadata';
import { buildStoreCode } from '@/lib/juicebox/transforms';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import type { Store } from '@/types';

interface UseOwnedStoresResult {
  stores: Store[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useOwnedStores(ownerAddress: Address | null): UseOwnedStoresResult {
  console.log('[useOwnedStores] Called with ownerAddress:', ownerAddress);

  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch,
  } = useBendystrawProjects({
    where: {
      owner: ownerAddress ?? undefined,
      chainId: COCOPAY_CHAIN_ID,
    },
  });

  console.log('[useOwnedStores] Bendystraw projects:', {
    count: projects.length,
    isLoading: projectsLoading,
    projectIds: projects.map((p) => p.projectId),
  });

  const metadataQueries = useQueries({
    queries: projects.map((project) => {
      const cid = project.metadataUri ? extractCidFromUri(project.metadataUri) : null;
      return {
        queryKey: ['project-metadata', cid],
        queryFn: async () => {
          if (!cid) throw new Error('No CID');
          console.log(
            `[useOwnedStores] Fetching metadata for project ${project.projectId}, CID:`,
            cid
          );
          const metadata = await fetchMetadataFromIPFS(cid);
          console.log(`[useOwnedStores] Metadata for project ${project.projectId}:`, {
            name: metadata.name,
            hasCocopay: !!metadata.cocopay,
            ticker: metadata.cocopay?.ticker,
          });
          return metadata;
        },
        enabled: !!cid && !!ownerAddress,
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
      };
    }),
  });

  const stores = useMemo(() => {
    console.log('[useOwnedStores] Building stores list...');
    if (!ownerAddress) {
      console.log('[useOwnedStores] No owner address, returning empty');
      return [];
    }

    const result: Store[] = [];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const metadataQuery = metadataQueries[i];

      console.log(`[useOwnedStores] Processing project ${project.projectId}:`, {
        hasMetadata: !!metadataQuery?.data,
        hasCocopay: !!metadataQuery?.data?.cocopay,
        isLoading: metadataQuery?.isLoading,
      });

      if (!metadataQuery?.data?.cocopay) {
        console.log(`[useOwnedStores] Skipping project ${project.projectId} - no cocopay metadata`);
        continue;
      }

      const metadata = metadataQuery.data;

      const store = {
        id: `${project.chainId}-${project.projectId}`,
        name: metadata.name,
        tokenSymbol: `$${metadata.cocopay!.ticker}`,
        storeCode: buildStoreCode(BigInt(project.projectId), project.chainId),
        balance: 0,
        isOwned: true,
      };
      console.log(`[useOwnedStores] Adding owned store:`, store);
      result.push(store);
    }

    console.log('[useOwnedStores] Total owned stores:', result.length);
    return result;
  }, [ownerAddress, projects, metadataQueries]);

  const isLoading =
    projectsLoading || metadataQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

  return {
    stores,
    isLoading,
    error: projectsError,
    refetch,
  };
}
