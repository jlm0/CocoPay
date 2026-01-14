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
import { queryKeys } from '@/lib/query';

interface UseCocoPayProjectRegistryResult {
  projects: StoredProject[];
  addProject: (project: Omit<StoredProject, 'addedAt'>) => Promise<void>;
  removeProject: (suckerGroupId: string) => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  refetch: () => void;
}

const SYNC_STALE_TIME = 5 * 60 * 1000;

export function useCocoPayProjectRegistry(): UseCocoPayProjectRegistryResult {
  const queryClient = useQueryClient();

  const localQuery = useQuery({
    queryKey: queryKeys.cocopayRegistry.local(),
    queryFn: () => getStoredProjects(),
    staleTime: Infinity,
  });

  const syncQuery = useQuery({
    queryKey: queryKeys.cocopayRegistry.sync(),
    queryFn: async () => {
      const local = await getStoredProjects();

      if (local.length === 0) {
        return [];
      }

      const results = await Promise.all(
        local.map(async (project) => {
          try {
            const bendystrawProject = await fetchProject(
              project.primaryProjectId,
              project.primaryChainId
            );
            return { project, valid: !!bendystrawProject };
          } catch {
            return { project, valid: true };
          }
        })
      );

      const validatedProjects = results.filter((r) => r.valid).map((r) => r.project);

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
      queryClient.invalidateQueries({ queryKey: queryKeys.cocopayRegistry.all });
    },
    [queryClient]
  );

  const removeProjectFn = useCallback(
    async (suckerGroupId: string) => {
      await removeStoredProject(suckerGroupId);
      queryClient.invalidateQueries({ queryKey: queryKeys.cocopayRegistry.all });
    },
    [queryClient]
  );

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cocopayRegistry.all });
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
