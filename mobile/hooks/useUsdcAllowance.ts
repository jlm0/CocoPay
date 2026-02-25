import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { useViemPublicClient } from './useViemPublicClient';
import { useParaAccount } from './useParaAccount';
import { USDC_ADDRESS } from '@/lib/juicebox/constants';
import { ERC20_ABI } from '@/lib/constants';
import { queryKeys } from '@/lib/query';

const ALLOWANCE_STALE_TIME = 10_000;
const ALLOWANCE_REFETCH_INTERVAL = 30_000;

export function useUsdcAllowance(spender: Address | undefined) {
  const { address } = useParaAccount();
  const client = useViemPublicClient();

  return useQuery({
    queryKey: queryKeys.usdcAllowance(address, spender),
    queryFn: async () => {
      if (!address || !spender) return null;

      const allowance = await client.readContract({
        address: USDC_ADDRESS as Address,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, spender],
      });

      return allowance;
    },
    enabled: !!address && !!spender,
    staleTime: ALLOWANCE_STALE_TIME,
    refetchInterval: ALLOWANCE_REFETCH_INTERVAL,
  });
}
