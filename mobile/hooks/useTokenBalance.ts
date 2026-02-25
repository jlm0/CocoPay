import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits, formatEther, type Hex, type Chain } from 'viem';
import { useViemPublicClient } from './useViemPublicClient';
import { useParaAccount } from './useParaAccount';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { ERC20_ABI } from '@/lib/constants';

const BALANCE_STALE_TIME = 3_000;
const BALANCE_REFETCH_INTERVAL = 5_000;

export type TokenConfig = {
  type: 'native' | 'erc20';
  address?: Hex;
  decimals: number;
  queryKey: (
    address: string | null | undefined,
    chainId: number
  ) => readonly (string | number | null | undefined)[];
  store: (raw: bigint, formatted: string) => Promise<void>;
};

export function useTokenBalance(config: TokenConfig, address?: Hex, chain: Chain = DEFAULT_CHAIN) {
  const { address: accountAddress } = useParaAccount();
  const client = useViemPublicClient(chain);

  const targetAddress = address ?? accountAddress;

  const query = useQuery({
    queryKey: config.queryKey(targetAddress, chain.id),
    queryFn: async () => {
      if (!targetAddress) return null;

      let balance: bigint;

      if (config.type === 'native') {
        balance = await client.getBalance({ address: targetAddress });
      } else {
        if (!config.address) {
          throw new Error('Token address required for ERC20');
        }
        balance = await client.readContract({
          address: config.address,
          abi: ERC20_ABI,
          functionName: 'balanceOf',
          args: [targetAddress],
        });
      }

      const formatted =
        config.type === 'native' ? formatEther(balance) : formatUnits(balance, config.decimals);

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
      config.store(query.data.raw, query.data.formatted);
    }
  }, [query.data?.raw, query.data?.formatted, config]);

  return query;
}
