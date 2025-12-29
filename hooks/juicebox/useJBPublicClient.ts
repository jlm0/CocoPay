import { useViemPublicClient } from '@/hooks/useViemPublicClient';
import { type OmnichainChainId } from '@/lib/juicebox/constants';
import { getChainById, getPrimaryChain } from '@/lib/juicebox/chain-selection';

export function useJBPublicClient(chainId?: OmnichainChainId) {
  const chain = chainId ? getChainById(chainId) : getPrimaryChain();
  return useViemPublicClient(chain);
}
