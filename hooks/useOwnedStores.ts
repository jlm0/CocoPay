import { useMemo } from 'react';
import type { Address } from 'viem';
import { useQuery, useQueries } from '@tanstack/react-query';
import { fetchProject, fetchParticipant, fetchPermissionHolders } from '@/lib/bendystraw';
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

export function useOwnedStores(operatorAddress: Address | null): UseOwnedStoresResult {
  const normalizedOperator = operatorAddress?.toLowerCase() as Address | undefined;

  const permissionHoldersQuery = useQuery({
    queryKey: queryKeys.bendystraw.permissionHolders({
      where: {
        operator: normalizedOperator,
        isRevnetOperator: true,
        chainId: COCOPAY_CHAIN_ID,
      },
    }),
    queryFn: () =>
      fetchPermissionHolders({
        where: {
          operator: normalizedOperator,
          isRevnetOperator: true,
          chainId: COCOPAY_CHAIN_ID,
        },
      }),
    enabled: !!normalizedOperator,
    staleTime: 30_000,
  });

  const operatedProjects = permissionHoldersQuery.data?.items ?? [];

  const projectQueries = useQueries({
    queries: operatedProjects.map((ph) => ({
      queryKey: queryKeys.bendystraw.project(ph.projectId, ph.chainId),
      queryFn: () => fetchProject(ph.projectId, ph.chainId),
      enabled: !!normalizedOperator,
      staleTime: 30_000,
    })),
  });

  const projects = projectQueries
    .map((q) => q.data)
    .filter((p): p is NonNullable<typeof p> => p !== null && p !== undefined);

  const metadataQueries = useQueries({
    queries: projects.map((project) => {
      const cid = project.metadataUri ? extractCidFromUri(project.metadataUri) : null;
      return {
        queryKey: queryKeys.projectMetadata.byCid(cid),
        queryFn: async () => {
          if (!cid) throw new Error('No CID');
          return fetchMetadataFromIPFS(cid);
        },
        enabled: !!cid && !!operatorAddress,
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
      };
    }),
  });

  const participantQueries = useQueries({
    queries: projects.map((project) => ({
      queryKey: queryKeys.bendystraw.participant(
        project.projectId,
        project.chainId,
        operatorAddress
      ),
      queryFn: () =>
        fetchParticipant({
          projectId: project.projectId,
          chainId: project.chainId,
          address: operatorAddress!,
        }),
      enabled: !!operatorAddress,
      staleTime: 30_000,
    })),
  });

  const stores = useMemo(() => {
    if (!operatorAddress) {
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
  }, [operatorAddress, projects, metadataQueries, participantQueries]);

  const permissionHoldersLoading =
    permissionHoldersQuery.isLoading && permissionHoldersQuery.fetchStatus !== 'idle';
  const projectsLoading = projectQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

  const isLoading =
    permissionHoldersLoading ||
    projectsLoading ||
    metadataQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle') ||
    participantQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

  const isFetching =
    permissionHoldersQuery.isFetching ||
    projectQueries.some((q) => q.isFetching) ||
    metadataQueries.some((q) => q.isFetching) ||
    participantQueries.some((q) => q.isFetching);

  return {
    stores,
    isLoading,
    isFetching,
    error: permissionHoldersQuery.error as Error | null,
    refetch: permissionHoldersQuery.refetch,
  };
}
