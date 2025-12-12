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
  error: Error | null;
  refetch: () => void;
}

export function useParticipatedStores(userAddress: Address | null): UseParticipatedStoresResult {
  console.log('[useParticipatedStores] Called with userAddress:', userAddress);

  const {
    projects: registeredProjects,
    isLoading: registryLoading,
    refetch,
  } = useCocoPayProjectRegistry();

  console.log('[useParticipatedStores] Registry projects:', {
    count: registeredProjects.length,
    isLoading: registryLoading,
    projects: registeredProjects,
  });

  const projectQueries = useQueries({
    queries: registeredProjects.map((project) => ({
      queryKey: ['bendystraw', 'project', project.projectId, project.chainId],
      queryFn: async () => {
        console.log(
          `[useParticipatedStores] Fetching project ${project.projectId} from Bendystraw...`
        );
        const result = await fetchProject(project.projectId, project.chainId);
        console.log(`[useParticipatedStores] Project ${project.projectId} result:`, {
          found: !!result,
          metadataUri: result?.metadataUri,
        });
        return result;
      },
      enabled: !!userAddress,
      staleTime: 30_000,
    })),
  });

  const participantQueries = useQueries({
    queries: registeredProjects.map((project) => ({
      queryKey: ['bendystraw', 'participants', project.projectId, project.chainId, 'balance', 100],
      queryFn: async () => {
        console.log(
          `[useParticipatedStores] Fetching participants for project ${project.projectId}...`
        );
        const result = await fetchParticipants({
          projectId: project.projectId,
          chainId: project.chainId,
          orderBy: 'balance',
          limit: 100,
        });
        console.log(`[useParticipatedStores] Participants for project ${project.projectId}:`, {
          count: result.items.length,
          addresses: result.items.map((p) => p.address),
        });
        return result;
      },
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
          console.log(`[useParticipatedStores] Fetching metadata, CID:`, cid);
          const metadata = await fetchMetadataFromIPFS(cid);
          console.log(`[useParticipatedStores] Metadata result:`, {
            name: metadata.name,
            hasCocopay: !!metadata.cocopay,
          });
          return metadata;
        },
        enabled: !!cid && !!userAddress && !!projectQueries[index]?.data,
        staleTime: Infinity,
        gcTime: 24 * 60 * 60 * 1000,
      };
    }),
  });

  const stores = useMemo(() => {
    console.log('[useParticipatedStores] Building participated stores...');
    if (!userAddress || registeredProjects.length === 0) {
      console.log('[useParticipatedStores] No user address or no registered projects');
      return [];
    }

    const result: Store[] = [];
    const lowerAddress = userAddress.toLowerCase();
    console.log('[useParticipatedStores] Looking for participant address:', lowerAddress);

    for (let i = 0; i < registeredProjects.length; i++) {
      const registeredProject = registeredProjects[i];
      const projectQuery = projectQueries[i];
      const participantQuery = participantQueries[i];
      const metadataQuery = metadataQueries[i];

      console.log(`[useParticipatedStores] Processing project ${registeredProject.projectId}:`, {
        hasProjectData: !!projectQuery?.data,
        hasParticipantData: !!participantQuery?.data,
        hasMetadata: !!metadataQuery?.data,
        hasCocopay: !!metadataQuery?.data?.cocopay,
      });

      if (!projectQuery?.data || !participantQuery?.data || !metadataQuery?.data?.cocopay) {
        console.log(
          `[useParticipatedStores] Skipping project ${registeredProject.projectId} - missing data`
        );
        continue;
      }

      const participant = participantQuery.data.items.find(
        (p) => p.address.toLowerCase() === lowerAddress
      );

      console.log(
        `[useParticipatedStores] User participation in project ${registeredProject.projectId}:`,
        {
          found: !!participant,
          balance: participant?.balance,
        }
      );

      if (!participant || BigInt(participant.balance) <= 0n) {
        console.log(
          `[useParticipatedStores] Skipping project ${registeredProject.projectId} - no balance`
        );
        continue;
      }

      const metadata = metadataQuery.data;
      const balanceRaw = BigInt(participant.balance);
      const balance = Number(balanceRaw) / 10 ** JB_TOKEN_DECIMALS;

      const store = {
        id: `${registeredProject.chainId}-${registeredProject.projectId}`,
        name: metadata.name,
        tokenSymbol: `$${metadata.cocopay!.ticker}`,
        storeCode: buildStoreCode(BigInt(registeredProject.projectId), registeredProject.chainId),
        balance,
        isOwned: false,
      };
      console.log(`[useParticipatedStores] Adding participated store:`, store);
      result.push(store);
    }

    console.log('[useParticipatedStores] Total participated stores:', result.length);
    return result;
  }, [userAddress, registeredProjects, projectQueries, participantQueries, metadataQueries]);

  const isLoading =
    registryLoading ||
    projectQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle') ||
    participantQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle') ||
    metadataQueries.some((q) => q.isLoading && q.fetchStatus !== 'idle');

  return {
    stores,
    isLoading,
    error: null,
    refetch,
  };
}
