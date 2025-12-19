import type { Hex, Chain } from 'viem';
import { useTokenBalance } from './useTokenBalance';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { storeEthBalance } from '@/lib/storage';
import { queryKeys } from '@/lib/query';

export function useViemEthBalance(address?: Hex, chain: Chain = DEFAULT_CHAIN) {
  return useTokenBalance(
    {
      type: 'native',
      decimals: 18,
      queryKey: queryKeys.balance.eth,
      store: storeEthBalance,
    },
    address,
    chain
  );
}
