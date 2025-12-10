import { useQuery } from '@tanstack/react-query';
import { formatEther, type Hex, type Chain } from 'viem';
import { useViemPublicClient } from './useViemPublicClient';
import { useParaAccount } from './useParaAccount';

export function useBalance(address?: Hex, chain?: Chain) {
  const { address: accountAddress } = useParaAccount();
  const client = useViemPublicClient(chain);

  const targetAddress = address ?? accountAddress;

  return useQuery({
    queryKey: ['balance', targetAddress, chain?.id],
    queryFn: async () => {
      if (!targetAddress) return null;
      const balance = await client.getBalance({ address: targetAddress });
      return {
        raw: balance,
        formatted: formatEther(balance),
      };
    },
    enabled: !!targetAddress,
  });
}
