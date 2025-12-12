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
    queryFn: async () => {
      console.log('[useCocoPayProjectRegistry] Loading local projects from storage...');
      const projects = await getStoredProjects();
      console.log('[useCocoPayProjectRegistry] Local projects loaded:', projects);
      return projects;
    },
    staleTime: Infinity,
  });

  const syncQuery = useQuery({
    queryKey: [...REGISTRY_QUERY_KEY, 'sync'],
    queryFn: async () => {
      console.log('[useCocoPayProjectRegistry] Starting sync with Bendystraw...');
      const local = await getStoredProjects();
      console.log('[useCocoPayProjectRegistry] Local projects for sync:', local);

      if (local.length === 0) {
        console.log('[useCocoPayProjectRegistry] No local projects to sync');
        return [];
      }

      const validatedProjects: StoredProject[] = [];

      for (const project of local) {
        try {
          console.log(
            `[useCocoPayProjectRegistry] Validating project ${project.projectId} on chain ${project.chainId}...`
          );
          const bendystrawProject = await fetchProject(project.projectId, project.chainId);
          console.log(
            `[useCocoPayProjectRegistry] Bendystraw response for project ${project.projectId}:`,
            bendystrawProject ? 'found' : 'not found'
          );
          if (bendystrawProject) {
            validatedProjects.push(project);
          }
        } catch (err) {
          console.warn(
            `[useCocoPayProjectRegistry] Error validating project ${project.projectId}, keeping it:`,
            err
          );
          validatedProjects.push(project);
        }
      }

      console.log('[useCocoPayProjectRegistry] Validated projects:', validatedProjects);

      if (validatedProjects.length !== local.length) {
        console.log(
          '[useCocoPayProjectRegistry] Pruning invalid projects, updating storage...',
          `${local.length} -> ${validatedProjects.length}`
        );
        await setStoredProjects(validatedProjects);
      }

      return validatedProjects;
    },
    staleTime: SYNC_STALE_TIME,
    enabled: (localQuery.data?.length ?? 0) > 0,
  });

  const addProject = useCallback(
    async (project: Omit<StoredProject, 'addedAt'>) => {
      console.log('[useCocoPayProjectRegistry] Adding project:', project);
      await addStoredProject(project);
      console.log('[useCocoPayProjectRegistry] Project added, invalidating queries');
      queryClient.invalidateQueries({ queryKey: REGISTRY_QUERY_KEY });
    },
    [queryClient]
  );

  const removeProjectFn = useCallback(
    async (projectId: number, chainId: number) => {
      console.log('[useCocoPayProjectRegistry] Removing project:', { projectId, chainId });
      await removeStoredProject(projectId, chainId);
      console.log('[useCocoPayProjectRegistry] Project removed, invalidating queries');
      queryClient.invalidateQueries({ queryKey: REGISTRY_QUERY_KEY });
    },
    [queryClient]
  );

  const refetch = useCallback(() => {
    console.log('[useCocoPayProjectRegistry] Manual refetch triggered');
    queryClient.invalidateQueries({ queryKey: REGISTRY_QUERY_KEY });
  }, [queryClient]);

  const projects = syncQuery.data ?? localQuery.data ?? [];
  console.log('[useCocoPayProjectRegistry] Returning projects:', projects.length, 'items');

  return {
    projects,
    addProject,
    removeProject: removeProjectFn,
    isLoading: localQuery.isLoading,
    isSyncing: syncQuery.isFetching,
    refetch,
  };
}
