import { useMemo, useCallback } from 'react';
import { useParaAccount } from '@/hooks/useParaAccount';
import { useOwnedStores } from '@/hooks/useOwnedStores';
import { useParticipatedStores } from '@/hooks/useParticipatedStores';
import type { Store } from '@/types';

interface UseCocoPayStoresResult {
  stores: Store[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCocoPayStores(): UseCocoPayStoresResult {
  const { address } = useParaAccount();
  console.log('[useCocoPayStores] Called with address:', address);

  const {
    stores: ownedStores,
    isLoading: ownedLoading,
    error: ownedError,
    refetch: refetchOwned,
  } = useOwnedStores(address);

  console.log('[useCocoPayStores] Owned stores:', {
    count: ownedStores.length,
    isLoading: ownedLoading,
    stores: ownedStores.map((s) => ({ id: s.id, name: s.name })),
  });

  const {
    stores: participatedStores,
    isLoading: participatedLoading,
    error: participatedError,
    refetch: refetchParticipated,
  } = useParticipatedStores(address);

  console.log('[useCocoPayStores] Participated stores:', {
    count: participatedStores.length,
    isLoading: participatedLoading,
    stores: participatedStores.map((s) => ({ id: s.id, name: s.name, balance: s.balance })),
  });

  const stores = useMemo(() => {
    console.log('[useCocoPayStores] Merging stores...');
    const ownedIds = new Set(ownedStores.map((s) => s.id));
    console.log('[useCocoPayStores] Owned IDs:', Array.from(ownedIds));

    const filteredParticipated = participatedStores
      .filter((s) => !ownedIds.has(s.id))
      .map((s) => ({ ...s, isOwned: false }));

    console.log(
      '[useCocoPayStores] Filtered participated (excluding owned):',
      filteredParticipated.length
    );

    const merged = [...ownedStores, ...filteredParticipated];

    const sorted = merged.sort((a, b) => {
      if (a.isOwned && !b.isOwned) return -1;
      if (!a.isOwned && b.isOwned) return 1;
      return b.balance - a.balance;
    });

    console.log('[useCocoPayStores] Final merged and sorted stores:', sorted.length);
    console.log(
      '[useCocoPayStores] Final stores:',
      sorted.map((s) => ({
        id: s.id,
        name: s.name,
        isOwned: s.isOwned,
        balance: s.balance,
      }))
    );

    return sorted;
  }, [ownedStores, participatedStores]);

  const refetch = useCallback(() => {
    console.log('[useCocoPayStores] Refetch triggered');
    refetchOwned();
    refetchParticipated();
  }, [refetchOwned, refetchParticipated]);

  return {
    stores,
    isLoading: ownedLoading || participatedLoading,
    error: ownedError || participatedError,
    refetch,
  };
}
