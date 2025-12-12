import { useQuery } from '@tanstack/react-query';
import { formatEther, type Hex, type Chain } from 'viem';
import { useViemPublicClient } from './useViemPublicClient';
import { useParaAccount } from './useParaAccount';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { storeEthBalance, getStoredBalancesSync } from '@/lib/storage';

const BALANCE_STALE_TIME = 3_000;
const BALANCE_REFETCH_INTERVAL = 5_000;

export function useViemEthBalance(address?: Hex, chain: Chain = DEFAULT_CHAIN) {
  const { address: accountAddress } = useParaAccount();
  const client = useViemPublicClient(chain);

  const targetAddress = address ?? accountAddress;

  return useQuery({
    queryKey: ['balance', 'eth', targetAddress, chain.id],
    queryFn: async () => {
      if (!targetAddress) return null;
      const balance = await client.getBalance({ address: targetAddress });
      const formatted = formatEther(balance);
      await storeEthBalance(balance, formatted);
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
      if (stored?.eth) {
        return {
          raw: BigInt(stored.eth.raw),
          formatted: stored.eth.formatted,
        };
      }
      return undefined;
    },
  });
}
