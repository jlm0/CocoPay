import type { Hex, Chain } from 'viem';
import { useTokenBalance } from './useTokenBalance';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { USDC_SEPOLIA_ADDRESS, TOKEN_DECIMALS } from '@/lib/constants';
import { storeUsdcBalance } from '@/lib/storage';
import { queryKeys } from '@/lib/query';

export function useViemUsdcBalance(address?: Hex, chain: Chain = DEFAULT_CHAIN) {
  return useTokenBalance(
    {
      type: 'erc20',
      address: USDC_SEPOLIA_ADDRESS,
      decimals: TOKEN_DECIMALS.USDC,
      queryKey: queryKeys.balance.usdc,
      store: storeUsdcBalance,
    },
    address,
    chain
  );
}
