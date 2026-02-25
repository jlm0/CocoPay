import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQueryClient, type QueryKey } from '@tanstack/react-query';
import { wasBackgroundedLongEnough, resetBackgroundTimer } from '@/lib/lifecycle';

interface UseFocusRefreshOptions {
  queryKeys: QueryKey[];
  thresholdMs?: number;
  alwaysRefreshOnFocus?: boolean;
}

export function useFocusRefresh({
  queryKeys,
  thresholdMs = 5 * 60 * 1000,
  alwaysRefreshOnFocus = false,
}: UseFocusRefreshOptions): void {
  const queryClient = useQueryClient();
  const hasRunOnMount = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasRunOnMount.current) {
        hasRunOnMount.current = true;
        return;
      }

      const shouldRefresh = alwaysRefreshOnFocus || wasBackgroundedLongEnough(thresholdMs);

      if (shouldRefresh) {
        for (const queryKey of queryKeys) {
          queryClient.invalidateQueries({ queryKey });
        }
        resetBackgroundTimer();
      }
    }, [queryClient, queryKeys, thresholdMs, alwaysRefreshOnFocus])
  );
}
