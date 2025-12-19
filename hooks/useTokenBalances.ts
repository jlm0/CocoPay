import { useCallback } from 'react';
import { useViemUsdcBalance } from './useViemUsdcBalance';
import type { Balance } from '@/types';

type UseTokenBalancesResult = {
  balances: Balance[];
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  error: Error | null;
};

export function useTokenBalances(): UseTokenBalancesResult {
  const usdcBalance = useViemUsdcBalance();

  const usdcAmount = usdcBalance.data?.formatted ? parseFloat(usdcBalance.data.formatted) : 0;

  const balances: Balance[] = [
    {
      token: 'USDC',
      amount: usdcAmount,
      usdValue: usdcAmount,
    },
  ];

  const refetch = useCallback(async () => {
    await usdcBalance.refetch();
  }, [usdcBalance]);

  return {
    balances,
    isLoading: usdcBalance.isLoading,
    isFetching: usdcBalance.isFetching,
    refetch,
    error: usdcBalance.error as Error | null,
  };
}
