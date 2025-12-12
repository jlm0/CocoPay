import { useCallback } from 'react';
import { useViemEthBalance } from './useViemEthBalance';
import { useViemUsdcBalance } from './useViemUsdcBalance';
import { useCoinGeckoPrice } from './useCoinGeckoPrice';
import type { Balance } from '@/types';

type UseTokenBalancesResult = {
  balances: Balance[];
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  error: Error | null;
};

export function useTokenBalances(): UseTokenBalancesResult {
  const ethBalance = useViemEthBalance();
  const usdcBalance = useViemUsdcBalance();
  const prices = useCoinGeckoPrice();

  const isLoading = ethBalance.isLoading || usdcBalance.isLoading || prices.isLoading;
  const isFetching = ethBalance.isFetching || usdcBalance.isFetching || prices.isFetching;
  const error = ethBalance.error || usdcBalance.error || prices.error;

  const ethAmount = ethBalance.data?.formatted ? parseFloat(ethBalance.data.formatted) : 0;
  const usdcAmount = usdcBalance.data?.formatted ? parseFloat(usdcBalance.data.formatted) : 0;

  const ethPrice = prices.data?.eth ?? 0;
  const usdcPrice = prices.data?.usdc ?? 1;

  const balances: Balance[] = [
    {
      token: 'USDC',
      amount: usdcAmount,
      usdValue: usdcAmount * usdcPrice,
    },
    {
      token: 'ETH',
      amount: ethAmount,
      usdValue: ethAmount * ethPrice,
    },
  ];

  const refetch = useCallback(async () => {
    await Promise.all([ethBalance.refetch(), usdcBalance.refetch(), prices.refetch()]);
  }, [ethBalance, usdcBalance, prices]);

  return {
    balances,
    isLoading,
    isFetching,
    refetch,
    error: error as Error | null,
  };
}
