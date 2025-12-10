import { useMemo } from 'react';
import { createPublicClient, http, type PublicClient, type Chain } from 'viem';
import { getAlchemyRpcUrl } from '@/lib/alchemy';
import { DEFAULT_CHAIN } from '@/lib/chains';

export function useViemPublicClient(chain: Chain = DEFAULT_CHAIN): PublicClient {
  return useMemo(() => {
    return createPublicClient({
      chain,
      transport: http(getAlchemyRpcUrl(chain)),
    });
  }, [chain]);
}
