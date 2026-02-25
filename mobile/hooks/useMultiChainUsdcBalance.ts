import { useMemo, useCallback } from 'react';
import { useQueries } from '@tanstack/react-query';
import { createPublicClient, http, formatUnits } from 'viem';
import { useParaAccount } from './useParaAccount';
import { SUPPORTED_CHAINS_ARRAY } from '@/lib/chains';
import { getAlchemyRpcUrl } from '@/lib/alchemy';
import {
  getUsdcAddress,
  TOKEN_DECIMALS,
  CHAIN_NAMES,
  type SupportedChainId,
} from '@/lib/constants';
import { ERC20_ABI } from '@/lib/constants';
import { queryKeys } from '@/lib/query';

const BALANCE_STALE_TIME = 10_000;
const BALANCE_REFETCH_INTERVAL = 15_000;

export type ChainBalance = {
  chainId: SupportedChainId;
  chainName: string;
  balance: bigint;
  formatted: string;
};

export type UseMultiChainUsdcBalanceResult = {
  balances: ChainBalance[];
  totalBalance: bigint;
  totalFormatted: string;
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useMultiChainUsdcBalance(): UseMultiChainUsdcBalanceResult {
  const { address } = useParaAccount();

  const queries = useQueries({
    queries: SUPPORTED_CHAINS_ARRAY.map((chain) => ({
      queryKey: queryKeys.balance.usdc(address, chain.id),
      queryFn: async (): Promise<ChainBalance> => {
        if (!address) {
          throw new Error('No address');
        }

        const client = createPublicClient({
          chain,
          transport: http(getAlchemyRpcUrl(chain)),
        });

        const usdcAddress = getUsdcAddress(chain.id as SupportedChainId);

        const balance = await client.readContract({
          address: usdcAddress,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [address],
        });

        return {
          chainId: chain.id as SupportedChainId,
          chainName: CHAIN_NAMES[chain.id as SupportedChainId],
          balance,
          formatted: formatUnits(balance, TOKEN_DECIMALS.USDC),
        };
      },
      enabled: !!address,
      staleTime: BALANCE_STALE_TIME,
      refetchInterval: BALANCE_REFETCH_INTERVAL,
    })),
  });

  const balances = useMemo(() => {
    return SUPPORTED_CHAINS_ARRAY.map((chain, index) => {
      const query = queries[index];
      if (query?.data) {
        return query.data;
      }
      return {
        chainId: chain.id as SupportedChainId,
        chainName: CHAIN_NAMES[chain.id as SupportedChainId],
        balance: 0n,
        formatted: '0',
      };
    });
  }, [queries]);

  const totalBalance = useMemo(() => {
    return balances.reduce((sum, b) => sum + b.balance, 0n);
  }, [balances]);

  const totalFormatted = useMemo(() => {
    return formatUnits(totalBalance, TOKEN_DECIMALS.USDC);
  }, [totalBalance]);

  const hasData = queries.some((q) => q.data !== undefined);
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
    balances,
    totalBalance,
    totalFormatted,
    hasData,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
