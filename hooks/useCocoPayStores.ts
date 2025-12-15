import { useMemo, useCallback, useEffect } from 'react';
import { useParaAccount } from '@/hooks/useParaAccount';
import { useOwnedStores } from '@/hooks/useOwnedStores';
import { useParticipatedStores } from '@/hooks/useParticipatedStores';
import { getStoredStoresSync, setStoredStores } from '@/lib/storage';
import type { Store } from '@/types';

interface UseCocoPayStoresResult {
  stores: Store[];
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCocoPayStores(): UseCocoPayStoresResult {
  const { address } = useParaAccount();

  const cachedStores = useMemo(() => {
    if (!address) return [];
    return getStoredStoresSync(address);
  }, [address]);

  const {
    stores: ownedStores,
    isLoading: ownedLoading,
    isFetching: ownedFetching,
    error: ownedError,
    refetch: refetchOwned,
  } = useOwnedStores(address);

  const {
    stores: participatedStores,
    isLoading: participatedLoading,
    isFetching: participatedFetching,
    error: participatedError,
    refetch: refetchParticipated,
  } = useParticipatedStores(address);

  const freshStores = useMemo(() => {
    const ownedIds = new Set(ownedStores.map((s) => s.id));

    const filteredParticipated = participatedStores
      .filter((s) => !ownedIds.has(s.id))
      .map((s) => ({ ...s, isOwned: false }));

    const merged = [...ownedStores, ...filteredParticipated];

    return merged.sort((a, b) => {
      if (a.isOwned && !b.isOwned) return -1;
      if (!a.isOwned && b.isOwned) return 1;
      return b.balance - a.balance;
    });
  }, [ownedStores, participatedStores]);

  const hasLoadedFreshData = !ownedLoading && !participatedLoading;

  const stores = useMemo(() => {
    if (hasLoadedFreshData && freshStores.length > 0) {
      return freshStores;
    }
    if (cachedStores.length > 0) {
      return cachedStores;
    }
    if (hasLoadedFreshData) {
      return freshStores;
    }
    return cachedStores;
  }, [hasLoadedFreshData, freshStores, cachedStores]);

  useEffect(() => {
    if (address && hasLoadedFreshData && freshStores.length > 0) {
      setStoredStores(freshStores, address);
    }
  }, [address, hasLoadedFreshData, freshStores]);

  const refetch = useCallback(() => {
    refetchOwned();
    refetchParticipated();
  }, [refetchOwned, refetchParticipated]);

  const isLoading = cachedStores.length === 0 && (ownedLoading || participatedLoading);

  return {
    stores,
    isLoading,
    isFetching: ownedFetching || participatedFetching,
    error: ownedError || participatedError,
    refetch,
  };
}
