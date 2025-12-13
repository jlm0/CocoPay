import { useMemo, useEffect } from 'react';
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
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useOwnedStores(ownerAddress: Address | null): UseOwnedStoresResult {
  useEffect(() => {
    console.log(`[useOwnedStores] MOUNT owner=${ownerAddress ?? 'none'}`);
  }, [ownerAddress]);

  const {
    projects,
    isLoading: projectsLoading,
    isFetching: projectsFetching,
    error: projectsError,
    refetch,
  } = useBendystrawProjects({
    where: {
      owner: ownerAddress ?? undefined,
      chainId: COCOPAY_CHAIN_ID,
    },
  });

  useEffect(() => {
    console.log(
      `[useOwnedStores] projects state: loading=${projectsLoading} error=${projectsError?.message ?? 'none'} count=${projects.length}`
    );
    if (projects.length > 0) {
      projects.forEach((p) => {
        console.log(
          `[useOwnedStores] project: id=${p.projectId} chainId=${p.chainId} uri=${p.metadataUri}`
        );
      });
    }
  }, [projects, projectsLoading, projectsError]);

  const metadataQueries = useQueries({
    queries: projects.map((project) => {
      const cid = project.metadataUri ? extractCidFromUri(project.metadataUri) : null;
      return {
        queryKey: ['project-metadata', cid],
        queryFn: async () => {
          if (!cid) throw new Error('No CID');
          return fetchMetadataFromIPFS(cid);
        },
        enabled: !!cid && !!ownerAddress,
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
      };
    }),
  });

  const stores = useMemo(() => {
    if (!ownerAddress) {
      return [];
    }

    const result: Store[] = [];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const metadataQuery = metadataQueries[i];

      console.log(
        `[useOwnedStores] processing project ${project.projectId}: metadataLoading=${metadataQuery?.isLoading} hasData=${!!metadataQuery?.data} hasCocopay=${!!metadataQuery?.data?.cocopay}`
      );

      if (!metadataQuery?.data?.cocopay) {
        continue;
      }

      const metadata = metadataQuery.data;

      result.push({
        id: `${project.chainId}-${project.projectId}`,
        name: metadata.name,
        tokenSymbol: `$${metadata.cocopay!.ticker}`,
        storeCode: buildStoreCode(BigInt(project.projectId), project.chainId),
        balance: 0,
        isOwned: true,
      });
    }

    console.log(`[useOwnedStores] built ${result.length} stores from ${projects.length} projects`);
    return result;
  }, [ownerAddress, projects, metadataQueries]);

  const isLoading =
    projectsLoading || metadataQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

  const isFetching = projectsFetching || metadataQueries.some((q) => q.isFetching);

  return {
    stores,
    isLoading,
    isFetching,
    error: projectsError,
    refetch,
  };
}
