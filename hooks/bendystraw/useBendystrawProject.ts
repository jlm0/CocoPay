import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { BendystrawProject } from '@/lib/bendystraw';
import { fetchProject } from '@/lib/bendystraw';
import { queryKeys } from '@/lib/query';

interface UseBendystrawProjectResult {
  project: BendystrawProject | null;
  isLoading: boolean;
  isRetrying: boolean;
  error: Error | null;
  refetch: () => void;
}

const MAX_RETRY_DURATION_MS = 60_000;
const INITIAL_RETRY_INTERVAL_MS = 2_000;
const MAX_RETRY_INTERVAL_MS = 8_000;

export function useBendystrawProject(
  projectId: number | null,
  chainId: number
): UseBendystrawProjectResult {
  const [retryStartTime, setRetryStartTime] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isAppActive, setIsAppActive] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: queryKeys.bendystraw.project(projectId, chainId),
    queryFn: async () => {
      if (projectId === null) {
        throw new Error('Project ID is required');
      }
      return fetchProject(projectId, chainId);
    },
    enabled: projectId !== null,
    staleTime: 30_000,
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setIsAppActive(state === 'active');
    });
    return () => subscription.remove();
  }, []);

  const shouldRetry =
    projectId !== null &&
    !query.isLoading &&
    !query.data &&
    !query.error &&
    isAppActive &&
    (retryStartTime === null || Date.now() - retryStartTime < MAX_RETRY_DURATION_MS);

  useEffect(() => {
    if (!shouldRetry) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (retryStartTime === null) {
      setRetryStartTime(Date.now());
    }

    const interval = Math.min(
      INITIAL_RETRY_INTERVAL_MS * Math.pow(1.5, retryCount),
      MAX_RETRY_INTERVAL_MS
    );

    timerRef.current = setTimeout(() => {
      query.refetch();
      setRetryCount((c) => c + 1);
    }, interval);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [shouldRetry, retryStartTime, retryCount, query]);

  useEffect(() => {
    if (query.data) {
      setRetryStartTime(null);
      setRetryCount(0);
    }
  }, [query.data]);

  const refetch = useCallback(() => {
    setRetryStartTime(Date.now());
    setRetryCount(0);
    query.refetch();
  }, [query]);

  const isRetrying = shouldRetry && retryCount > 0;

  return {
    project: query.data ?? null,
    isLoading: query.isLoading,
    isRetrying,
    error: query.error as Error | null,
    refetch,
  };
}
