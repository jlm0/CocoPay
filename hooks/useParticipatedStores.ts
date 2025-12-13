import { useMemo } from 'react';
import type { Address } from 'viem';
import { useQueries } from '@tanstack/react-query';
import { useCocoPayProjectRegistry } from '@/hooks/useCocoPayProjectRegistry';
import { fetchProject, fetchParticipants } from '@/lib/bendystraw';
import { fetchMetadataFromIPFS, extractCidFromUri } from '@/lib/juicebox/metadata';
import { buildStoreCode } from '@/lib/juicebox/transforms';
import { JB_TOKEN_DECIMALS } from '@/lib/juicebox/constants';
import type { Store } from '@/types';

interface UseParticipatedStoresResult {
  stores: Store[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useParticipatedStores(userAddress: Address | null): UseParticipatedStoresResult {
  const {
    projects: registeredProjects,
    isLoading: registryLoading,
    refetch,
  } = useCocoPayProjectRegistry();

  const projectQueries = useQueries({
    queries: registeredProjects.map((project) => ({
      queryKey: ['bendystraw', 'project', project.projectId, project.chainId],
      queryFn: () => fetchProject(project.projectId, project.chainId),
      enabled: !!userAddress,
      staleTime: 30_000,
    })),
  });

  const participantQueries = useQueries({
    queries: registeredProjects.map((project) => ({
      queryKey: ['bendystraw', 'participants', project.projectId, project.chainId, 'balance', 100],
      queryFn: () =>
        fetchParticipants({
          projectId: project.projectId,
          chainId: project.chainId,
          orderBy: 'balance',
          limit: 100,
        }),
      enabled: !!userAddress,
      staleTime: 30_000,
    })),
  });

  const metadataQueries = useQueries({
    queries: projectQueries.map((query, index) => {
      const project = query.data;
      const cid = project?.metadataUri ? extractCidFromUri(project.metadataUri) : null;
      return {
        queryKey: ['project-metadata', cid],
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
    if (!userAddress || registeredProjects.length === 0) {
      return [];
    }

    const result: Store[] = [];
    const lowerAddress = userAddress.toLowerCase();

    for (let i = 0; i < registeredProjects.length; i++) {
      const registeredProject = registeredProjects[i];
      const projectQuery = projectQueries[i];
      const participantQuery = participantQueries[i];
      const metadataQuery = metadataQueries[i];

      if (!projectQuery?.data || !participantQuery?.data || !metadataQuery?.data?.cocopay) {
        continue;
      }

      const participant = participantQuery.data.items.find(
        (p) => p.address.toLowerCase() === lowerAddress
      );

      if (!participant || BigInt(participant.balance) <= 0n) {
        continue;
      }

      const metadata = metadataQuery.data;
      const balanceRaw = BigInt(participant.balance);
      const balance = Number(balanceRaw) / 10 ** JB_TOKEN_DECIMALS;

      result.push({
        id: `${registeredProject.chainId}-${registeredProject.projectId}`,
        name: metadata.name,
        tokenSymbol: `$${metadata.cocopay!.ticker}`,
        storeCode: buildStoreCode(BigInt(registeredProject.projectId), registeredProject.chainId),
        balance,
        isOwned: false,
      });
    }

    return result;
  }, [userAddress, registeredProjects, projectQueries, participantQueries, metadataQueries]);

  const isLoading =
    registryLoading ||
    projectQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle') ||
    participantQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle') ||
    metadataQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

  const isFetching =
    projectQueries.some((q) => q.isFetching) ||
    participantQueries.some((q) => q.isFetching) ||
    metadataQueries.some((q) => q.isFetching);

  return {
    stores,
    isLoading,
    isFetching,
    error: null,
    refetch,
  };
}
