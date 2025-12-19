import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatEther, type Hex, type Chain } from 'viem';
import { useViemPublicClient } from './useViemPublicClient';
import { useParaAccount } from './useParaAccount';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { storeEthBalance } from '@/lib/storage';
import { queryKeys } from '@/lib/query';

const BALANCE_STALE_TIME = 3_000;
const BALANCE_REFETCH_INTERVAL = 5_000;

export function useViemEthBalance(address?: Hex, chain: Chain = DEFAULT_CHAIN) {
  const { address: accountAddress } = useParaAccount();
  const client = useViemPublicClient(chain);

  const targetAddress = address ?? accountAddress;

  const query = useQuery({
    queryKey: queryKeys.balance.eth(targetAddress, chain.id),
    queryFn: async () => {
      if (!targetAddress) return null;
      const balance = await client.getBalance({ address: targetAddress });
      const formatted = formatEther(balance);
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
      storeEthBalance(query.data.raw, query.data.formatted);
    }
  }, [query.data?.raw, query.data?.formatted]);

  return query;
}
