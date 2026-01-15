import { useEffect, useState, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

const DEFAULT_STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

let backgroundTimestamp: number | null = null;
let isInitialized = false;

export function initializeAppLifecycle(): () => void {
  if (isInitialized) {
    return () => {};
  }

  const subscription = AppState.addEventListener('change', handleAppStateChange);
  isInitialized = true;

  return () => {
    subscription.remove();
    isInitialized = false;
    backgroundTimestamp = null;
  };
}

function handleAppStateChange(nextState: AppStateStatus): void {
  if (nextState === 'background' || nextState === 'inactive') {
    backgroundTimestamp = Date.now();
  }
}

export function getBackgroundDurationMs(): number {
  if (backgroundTimestamp === null) {
    return 0;
  }
  return Date.now() - backgroundTimestamp;
}

export function wasBackgroundedLongEnough(thresholdMs: number = DEFAULT_STALE_THRESHOLD_MS): boolean {
  return getBackgroundDurationMs() >= thresholdMs;
}

export function resetBackgroundTimer(): void {
  backgroundTimestamp = null;
}

interface UseAppLifecycleResult {
  isActive: boolean;
  wasStale: boolean;
  resetStaleFlag: () => void;
}

export function useAppLifecycle(
  thresholdMs: number = DEFAULT_STALE_THRESHOLD_MS
): UseAppLifecycleResult {
  const [isActive, setIsActive] = useState(AppState.currentState === 'active');
  const [wasStale, setWasStale] = useState(false);

  const resetStaleFlag = useCallback(() => {
    setWasStale(false);
    resetBackgroundTimer();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const becameActive = nextState === 'active';
      setIsActive(becameActive);

      if (becameActive && wasBackgroundedLongEnough(thresholdMs)) {
        setWasStale(true);
      }
    });

    return () => subscription.remove();
  }, [thresholdMs]);

  return {
    isActive,
    wasStale,
    resetStaleFlag,
  };
}
