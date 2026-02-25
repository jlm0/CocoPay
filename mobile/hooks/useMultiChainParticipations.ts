import { useMemo, useCallback } from 'react';
import { useQueries } from '@tanstack/react-query';
import type { Address } from 'viem';
import { useParaAccount } from './useParaAccount';
import { fetchParticipantsByAddress, type BendystrawParticipant } from '@/lib/bendystraw';
import { SUPPORTED_CHAIN_IDS } from '@/lib/constants';
import { queryKeys } from '@/lib/query';

const PARTICIPATIONS_STALE_TIME = 30_000;

export type UseMultiChainParticipationsResult = {
  participations: BendystrawParticipant[];
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useMultiChainParticipations(): UseMultiChainParticipationsResult {
  const { address } = useParaAccount();
  const normalizedAddress = address?.toLowerCase() as Address | undefined;

  const queries = useQueries({
    queries: SUPPORTED_CHAIN_IDS.map((chainId) => ({
      queryKey: queryKeys.bendystraw.participations(normalizedAddress ?? null, chainId),
      queryFn: async () => {
        if (!normalizedAddress) {
          throw new Error('No address');
        }

        const result = await fetchParticipantsByAddress({
          address: normalizedAddress,
          chainId,
        });

        return result.items;
      },
      enabled: !!normalizedAddress,
      staleTime: PARTICIPATIONS_STALE_TIME,
    })),
  });

  const participations = useMemo(() => {
    const allParticipations: BendystrawParticipant[] = [];

    for (const query of queries) {
      if (query.data && Array.isArray(query.data)) {
        allParticipations.push(...query.data);
      }
    }

    return allParticipations.filter((p) => BigInt(p.balance) > 0n);
  }, [queries]);

  const hasData = queries.some((q) => Array.isArray(q.data));
  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);

  const error = useMemo(() => {
    const firstError = queries.find((q) => q.error)?.error;
    return firstError ? (firstError as Error) : null;
  }, [queries]);

  const refetch = useCallback(() => {
    queries.forEach((q) => q.refetch());
  }, [queries]);

  return {
    participations,
    hasData,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
