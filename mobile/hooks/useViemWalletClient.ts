import { useMemo } from 'react';
import { createWalletClient, http, type WalletClient, type Chain } from 'viem';
import { getAlchemyRpcUrl } from '@/lib/alchemy';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { useParaAccount } from './useParaAccount';

interface UseViemWalletClientResult {
  walletClient: WalletClient | null;
  isReady: boolean;
}

export function useViemWalletClient(chain: Chain = DEFAULT_CHAIN): UseViemWalletClientResult {
  const { account } = useParaAccount();

  const walletClient = useMemo(() => {
    if (!account) {
      return null;
    }

    return createWalletClient({
      account,
      chain,
      transport: http(getAlchemyRpcUrl(chain)),
    });
  }, [account, chain]);

  return {
    walletClient,
    isReady: walletClient !== null,
  };
}
