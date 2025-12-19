import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits, type Hex, type Chain } from 'viem';
import { useViemPublicClient } from './useViemPublicClient';
import { useParaAccount } from './useParaAccount';
import { USDC_SEPOLIA_ADDRESS, TOKEN_DECIMALS, ERC20_ABI } from '@/lib/constants';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { storeUsdcBalance } from '@/lib/storage';
import { queryKeys } from '@/lib/query';

const BALANCE_STALE_TIME = 3_000;
const BALANCE_REFETCH_INTERVAL = 5_000;

export function useViemUsdcBalance(address?: Hex, chain: Chain = DEFAULT_CHAIN) {
  const { address: accountAddress } = useParaAccount();
  const client = useViemPublicClient(chain);

  const targetAddress = address ?? accountAddress;

  const query = useQuery({
    queryKey: queryKeys.balance.usdc(targetAddress, chain.id),
    queryFn: async () => {
      if (!targetAddress) return null;

      const balance = await client.readContract({
        address: USDC_SEPOLIA_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [targetAddress],
      });

      const formatted = formatUnits(balance, TOKEN_DECIMALS.USDC);

      return {
        raw: balance,
        formatted,
      };
    },
    enabled: !!targetAddress,
    staleTime: BALANCE_STALE_TIME,
    refetchInterval: BALANCE_REFETCH_INTERVAL,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (query.data?.raw !== undefined) {
      storeUsdcBalance(query.data.raw, query.data.formatted);
    }
  }, [query.data?.raw, query.data?.formatted]);

  return query;
}
