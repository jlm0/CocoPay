import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStoredProjects,
  addStoredProject,
  removeStoredProject,
  setStoredProjects,
  type StoredProject,
} from '@/lib/storage';
import { fetchProject } from '@/lib/bendystraw';

interface UseCocoPayProjectRegistryResult {
  projects: StoredProject[];
  addProject: (project: Omit<StoredProject, 'addedAt'>) => Promise<void>;
  removeProject: (projectId: number, chainId: number) => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  refetch: () => void;
}

const REGISTRY_QUERY_KEY = ['cocopay-registry'];
const SYNC_STALE_TIME = 5 * 60 * 1000;

export function useCocoPayProjectRegistry(): UseCocoPayProjectRegistryResult {
  const queryClient = useQueryClient();

  const localQuery = useQuery({
    queryKey: [...REGISTRY_QUERY_KEY, 'local'],
    queryFn: () => getStoredProjects(),
    staleTime: Infinity,
  });

  const syncQuery = useQuery({
    queryKey: [...REGISTRY_QUERY_KEY, 'sync'],
    queryFn: async () => {
      const local = await getStoredProjects();

      if (local.length === 0) {
        return [];
      }

      const validatedProjects: StoredProject[] = [];

      for (const project of local) {
        try {
          const bendystrawProject = await fetchProject(project.projectId, project.chainId);
          if (bendystrawProject) {
            validatedProjects.push(project);
          }
        } catch {
          validatedProjects.push(project);
        }
      }

      if (validatedProjects.length !== local.length) {
        await setStoredProjects(validatedProjects);
      }

      return validatedProjects;
    },
    staleTime: SYNC_STALE_TIME,
    enabled: (localQuery.data?.length ?? 0) > 0,
  });

  const addProject = useCallback(
    async (project: Omit<StoredProject, 'addedAt'>) => {
      await addStoredProject(project);
      queryClient.invalidateQueries({ queryKey: REGISTRY_QUERY_KEY });
    },
    [queryClient]
  );

  const removeProjectFn = useCallback(
    async (projectId: number, chainId: number) => {
      await removeStoredProject(projectId, chainId);
      queryClient.invalidateQueries({ queryKey: REGISTRY_QUERY_KEY });
    },
    [queryClient]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: REGISTRY_QUERY_KEY });
  }, [queryClient]);

  const projects = syncQuery.data ?? localQuery.data ?? [];

  return {
    projects,
    addProject,
    removeProject: removeProjectFn,
    isLoading: localQuery.isLoading,
    isSyncing: syncQuery.isFetching,
    refetch,
  };
}
