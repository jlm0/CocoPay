import { useMemo } from 'react';
import type { Address } from 'viem';
import { useQueries } from '@tanstack/react-query';
import { useBendystrawProjects } from '@/hooks/bendystraw';
import { fetchParticipant } from '@/lib/bendystraw';
import { fetchMetadataFromIPFS, extractCidFromUri } from '@/lib/juicebox/metadata';
import { buildStoreCode } from '@/lib/juicebox/transforms';
import { COCOPAY_CHAIN_ID, JB_TOKEN_DECIMALS } from '@/lib/juicebox/constants';
import { queryKeys } from '@/lib/query';
import type { Store } from '@/types';

interface UseOwnedStoresResult {
  stores: Store[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useOwnedStores(ownerAddress: Address | null): UseOwnedStoresResult {
  const normalizedOwner = ownerAddress?.toLowerCase() as Address | undefined;

  const {
    projects,
    isLoading: projectsLoading,
    isFetching: projectsFetching,
    error: projectsError,
    refetch,
  } = useBendystrawProjects({
    where: {
      owner: normalizedOwner,
      chainId: COCOPAY_CHAIN_ID,
    },
  });

  const metadataQueries = useQueries({
    queries: projects.map((project) => {
      const cid = project.metadataUri ? extractCidFromUri(project.metadataUri) : null;
      return {
        queryKey: queryKeys.projectMetadata.byCid(cid),
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

  const participantQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: queryKeys.bendystraw.participant(project.projectId, project.chainId, ownerAddress),
      queryFn: () =>
        fetchParticipant({
          projectId: project.projectId,
          chainId: project.chainId,
          address: ownerAddress!,
        }),
      enabled: !!ownerAddress,
      staleTime: 30_000,
    })),
  });

  const stores = useMemo(() => {
    if (!ownerAddress) {
      return [];
    }

    const result: Store[] = [];

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      const metadataQuery = metadataQueries[i];
      const participantQuery = participantQueries[i];

      if (!metadataQuery?.data?.cocopay) {
        continue;
      }

      const metadata = metadataQuery.data;
      const participant = participantQuery?.data;
      const balanceRaw = participant?.balance ? BigInt(participant.balance) : 0n;
      const balance = Number(balanceRaw) / 10 ** JB_TOKEN_DECIMALS;

      result.push({
        id: `${project.chainId}-${project.projectId}`,
        name: metadata.name,
        tokenSymbol: `$${metadata.cocopay!.ticker}`,
        storeCode: buildStoreCode(BigInt(project.projectId), project.chainId),
        balance,
        isOwned: true,
      });
    }

    return result;
  }, [ownerAddress, projects, metadataQueries, participantQueries]);

  const isLoading =
    projectsLoading ||
    metadataQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle') ||
    participantQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

  const isFetching =
    projectsFetching ||
    metadataQueries.some((q) => q.isFetching) ||
    participantQueries.some((q) => q.isFetching);

  return {
    stores,
    isLoading,
    isFetching,
    error: projectsError,
    refetch,
  };
}
