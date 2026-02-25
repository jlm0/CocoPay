import { useCallback, useMemo } from 'react';
import { useUnifiedUsdBalance } from './useUnifiedUsdBalance';
import type { ChainBalance } from './useMultiChainUsdcBalance';
import type { ReclaimableBalance } from './useReclaimableTokenValue';
import type { Balance } from '@/types';

type UseTokenBalancesResult = {
  balances: Balance[];
  totalUsd: number;
  usdcByChain: ChainBalance[];
  reclaimableByProject: ReclaimableBalance[];
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  error: Error | null;
};

export function useTokenBalances(): UseTokenBalancesResult {
  const {
    totalUsdc,
    totalUsd,
    usdcByChain,
    reclaimableByProject,
    hasData,
    isLoading,
    isFetching,
    error,
    refetch: refetchUnified,
  } = useUnifiedUsdBalance();

  const balances: Balance[] = useMemo(
    () => [
      {
        token: 'USDC' as const,
        amount: totalUsdc,
        usdValue: totalUsd,
      },
    ],
    [totalUsdc, totalUsd]
  );

  const refetch = useCallback(async () => {
    refetchUnified();
  }, [refetchUnified]);

  return {
    balances,
    totalUsd,
    usdcByChain,
    reclaimableByProject,
    hasData,
    isLoading,
    isFetching,
    refetch,
    error,
  };
}
