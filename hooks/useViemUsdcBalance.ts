import { useQuery } from '@tanstack/react-query';
import { formatUnits, type Hex, type Chain } from 'viem';
import { useViemPublicClient } from './useViemPublicClient';
import { useParaAccount } from './useParaAccount';
import { USDC_SEPOLIA_ADDRESS, TOKEN_DECIMALS, ERC20_ABI } from '@/lib/constants';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { storeUsdcBalance, getStoredBalancesSync } from '@/lib/storage';

const BALANCE_STALE_TIME = 3_000;
const BALANCE_REFETCH_INTERVAL = 5_000;

export function useViemUsdcBalance(address?: Hex, chain: Chain = DEFAULT_CHAIN) {
  const { address: accountAddress } = useParaAccount();
  const client = useViemPublicClient(chain);

  const targetAddress = address ?? accountAddress;

  return useQuery({
    queryKey: ['balance', 'usdc', targetAddress, chain.id],
    queryFn: async () => {
      if (!targetAddress) return null;

      const balance = await client.readContract({
        address: USDC_SEPOLIA_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [targetAddress],
      });

      const formatted = formatUnits(balance, TOKEN_DECIMALS.USDC);
      await storeUsdcBalance(balance, formatted);

      return {
        raw: balance,
        formatted,
      };
    },
    enabled: !!targetAddress,
    staleTime: BALANCE_STALE_TIME,
    refetchInterval: BALANCE_REFETCH_INTERVAL,
    refetchOnMount: true,
    initialData: () => {
      const stored = getStoredBalancesSync();
      if (stored?.usdc) {
        return {
          raw: BigInt(stored.usdc.raw),
          formatted: stored.usdc.formatted,
        };
      }
      return undefined;
    },
  });
}
