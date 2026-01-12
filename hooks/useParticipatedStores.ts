import { useMemo } from 'react';
import type { Address } from 'viem';
import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchParticipantsByAddress, fetchProject } from '@/lib/bendystraw';
import { fetchMetadataFromIPFS, extractCidFromUri } from '@/lib/juicebox/metadata';
import { buildStoreCode } from '@/lib/juicebox/transforms';
import { COCOPAY_CHAIN_ID, JB_TOKEN_DECIMALS } from '@/lib/juicebox/constants';
import { resolveIpfsUri } from '@/lib/pinata';
import { queryKeys } from '@/lib/query';
import type { Store } from '@/types';

interface UseParticipatedStoresResult {
  stores: Store[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useParticipatedStores(userAddress: Address | null): UseParticipatedStoresResult {
  const normalizedAddress = userAddress?.toLowerCase() as Address | undefined;

  const participationsQuery = useQuery({
    queryKey: queryKeys.bendystraw.participations(normalizedAddress ?? null, COCOPAY_CHAIN_ID),
    queryFn: () =>
      fetchParticipantsByAddress({
        address: normalizedAddress!,
        chainId: COCOPAY_CHAIN_ID,
      }),
    enabled: !!normalizedAddress,
    staleTime: 30_000,
  });

  const participations = useMemo(
    () => participationsQuery.data?.items ?? [],
    [participationsQuery.data?.items]
  );

  const projectQueries = useQueries({
    queries: participations.map((p) => ({
      queryKey: queryKeys.bendystraw.project(p.projectId, p.chainId),
      queryFn: () => fetchProject(p.projectId, p.chainId),
      enabled: !!userAddress,
      staleTime: 30_000,
    })),
  });

  const metadataQueries = useQueries({
    queries: projectQueries.map((query, index) => {
      const project = query.data;
      const cid = project?.metadataUri ? extractCidFromUri(project.metadataUri) : null;
      return {
        queryKey: queryKeys.projectMetadata.byCid(cid),
        queryFn: async () => {
          if (!cid) throw new Error('No CID');
          return fetchMetadataFromIPFS(cid);
        },
        enabled: !!cid && !!userAddress && !!projectQueries[index]?.data,
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
      };
    }),
  });

  const stores = useMemo(() => {
    if (!userAddress || participations.length === 0) {
      return [];
    }

    const result: Store[] = [];

    for (let i = 0; i < participations.length; i++) {
      const participation = participations[i];
      const projectQuery = projectQueries[i];
      const metadataQuery = metadataQueries[i];

      if (!projectQuery?.data || !metadataQuery?.data?.cocopay) {
        continue;
      }

      const metadata = metadataQuery.data;
      const balanceRaw = BigInt(participation.balance);
      const balance = Number(balanceRaw) / 10 ** JB_TOKEN_DECIMALS;

      result.push({
        id: `${participation.chainId}-${participation.projectId}`,
        name: metadata.name,
        tokenSymbol: `$${metadata.cocopay!.ticker}`,
        storeCode: buildStoreCode(BigInt(participation.projectId), participation.chainId),
        balance,
        isOwned: false,
        logoUri: resolveIpfsUri(metadata.logoUri),
      });
    }

    return result;
  }, [userAddress, participations, projectQueries, metadataQueries]);

  const isLoading =
    participationsQuery.isLoading ||
    projectQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle') ||
    metadataQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

  const isFetching =
    participationsQuery.isFetching ||
    projectQueries.some((q) => q.isFetching) ||
    metadataQueries.some((q) => q.isFetching);

  return {
    stores,
    isLoading,
    isFetching,
    error: participationsQuery.error as Error | null,
    refetch: participationsQuery.refetch,
  };
}
