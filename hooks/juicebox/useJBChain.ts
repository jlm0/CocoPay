import { useMemo } from 'react';
import { COCOPAY_CHAIN, COCOPAY_CHAIN_ID, JB_VERSION } from '@/lib/juicebox/constants';
import { CONTRACTS } from '@/lib/juicebox/contracts';

export function useJBChain() {
  return useMemo(
    () => ({
      chain: COCOPAY_CHAIN,
      chainId: COCOPAY_CHAIN_ID,
      version: JB_VERSION,
      contracts: CONTRACTS,
      isSupported: true,
    }),
    []
  );
}
