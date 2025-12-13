import { useMemo, useCallback } from 'react';
import { useParaAccount } from '@/hooks/useParaAccount';
import { useOwnedStores } from '@/hooks/useOwnedStores';
import { useParticipatedStores } from '@/hooks/useParticipatedStores';
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

  const stores = useMemo(() => {
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

  const refetch = useCallback(() => {
    refetchOwned();
    refetchParticipated();
  }, [refetchOwned, refetchParticipated]);

  return {
    stores,
    isLoading: ownedLoading || participatedLoading,
    isFetching: ownedFetching || participatedFetching,
    error: ownedError || participatedError,
    refetch,
  };
}
