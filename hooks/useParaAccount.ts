import { useMemo } from 'react';
import type { LocalAccount, Hex } from 'viem';
import { createEip7702ParaAccount } from '@/lib/para/eip7702';
import { para } from '@/lib/para';
import { usePara } from '@/providers/ParaProvider';

interface UseParaAccountResult {
  account: LocalAccount | null;
  address: Hex | null;
  isReady: boolean;
}

export function useParaAccount(): UseParaAccountResult {
  const { isAuthenticated, wallets } = usePara();

  const { account, address } = useMemo(() => {
    if (!isAuthenticated || wallets.length === 0) {
      return { account: null, address: null };
    }

    const wallet = wallets[0];
    const walletAddress = wallet.address as Hex;
    const paraAccount = createEip7702ParaAccount(para, walletAddress, wallet.id);

    return { account: paraAccount, address: walletAddress };
  }, [isAuthenticated, wallets]);

  return {
    account,
    address,
    isReady: account !== null,
  };
}
