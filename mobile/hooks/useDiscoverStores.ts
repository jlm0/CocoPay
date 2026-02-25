import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useBendystrawProjects } from '@/hooks/bendystraw';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import {
  type CocoPayMetadata,
  type ProjectMetadata,
  fetchMetadataFromIPFS,
} from '@/lib/juicebox/metadata';
import { extractCidFromUri, resolveIpfsUri } from '@/lib/pinata';
import { queryKeys } from '@/lib/query/keys';
import type { DiscoverStore } from '@/types';
import type { BendystrawProject } from '@/lib/bendystraw/types';

interface ProjectMetadataWithCocopay extends ProjectMetadata {
  cocopay?: CocoPayMetadata;
}

interface UseDiscoverStoresResult {
  stores: DiscoverStore[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

function transformToStore(
  project: BendystrawProject,
  metadata: ProjectMetadataWithCocopay
): DiscoverStore | null {
  const cocopay = metadata.cocopay;
  if (!cocopay) return null;

  return {
    id: `${project.chainId}-${project.projectId}`,
    projectId: project.projectId,
    chainId: project.chainId,
    suckerGroupId: project.suckerGroupId,
    name: metadata.name ?? 'Unknown Store',
    tokenSymbol: `$${cocopay.ticker}`,
    description: metadata.description,
    logoUri: resolveIpfsUri(metadata.logoUri),
    address: cocopay.address,
    cashBackPercent: cocopay.cashBackPercent,
    issuanceCutPercent: cocopay.issuanceCutPercent,
  };
}

export function useDiscoverStores(): UseDiscoverStoresResult {
  const {
    projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch,
  } = useBendystrawProjects({
    where: {
      chainId: COCOPAY_CHAIN_ID,
      isRevnet: true,
    },
    orderBy: 'createdAt',
    orderDirection: 'desc',
    limit: 100,
  });

  const v5Projects = useMemo(() => {
    return projects.filter((project) => project.id.startsWith('5-'));
  }, [projects]);

  const projectsNeedingIpfsFetch = useMemo(() => {
    return v5Projects.filter((project) => !!project.metadataUri);
  }, [v5Projects]);

  const ipfsQueries = useQueries({
    queries: projectsNeedingIpfsFetch.map((project) => {
      const cid = extractCidFromUri(project.metadataUri ?? '');
      return {
        queryKey: queryKeys.projectMetadata.byCid(cid),
        queryFn: async () => {
          if (!cid) throw new Error('No CID');
          return fetchMetadataFromIPFS(cid);
        },
        enabled: !!cid,
        staleTime: 1000 * 60 * 60,
        retry: 1,
      };
    }),
  });

  const ipfsMetadataMap = useMemo(() => {
    const map = new Map<number, ProjectMetadataWithCocopay>();
    projectsNeedingIpfsFetch.forEach((project, index) => {
      const query = ipfsQueries[index];
      if (query?.data) {
        map.set(project.projectId, query.data as ProjectMetadataWithCocopay);
      }
    });
    return map;
  }, [projectsNeedingIpfsFetch, ipfsQueries]);

  const stores = useMemo(() => {
    const result: DiscoverStore[] = [];

    for (const project of v5Projects) {
      const ipfsMetadata = ipfsMetadataMap.get(project.projectId);
      if (ipfsMetadata?.cocopay) {
        const store = transformToStore(project, ipfsMetadata);
        if (store) result.push(store);
      }
    }

    return result;
  }, [v5Projects, ipfsMetadataMap]);

  const isLoading =
    projectsLoading || (ipfsQueries.length > 0 && ipfsQueries.every((q) => q.isLoading));
  const error = projectsError ?? null;

  return {
    stores,
    isLoading,
    error,
    refetch,
  };
}
