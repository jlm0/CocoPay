import { useMemo } from 'react';
import { useMultiChainUsdcBalance } from './useMultiChainUsdcBalance';
import {
  getChainWithSufficientBalance,
  getChainWithHighestBalance,
  getPrimaryChainId,
} from '@/lib/juicebox/chain-selection';
import type { OmnichainChainId } from '@/lib/juicebox/constants';

export type ChainSelectionResult = {
  chainId: OmnichainChainId;
  hasSufficientBalance: boolean;
  selectedBalance: bigint;
  totalBalance: bigint;
  isLoading: boolean;
};

export function useChainForPayment(requiredAmount: bigint): ChainSelectionResult {
  const { balances, totalBalance, isLoading } = useMultiChainUsdcBalance();

  const balancesByChain = useMemo(() => {
    const map = new Map<OmnichainChainId, bigint>();
    for (const balance of balances) {
      map.set(balance.chainId, balance.balance);
    }
    return map;
  }, [balances]);

  const result = useMemo((): Omit<ChainSelectionResult, 'isLoading'> => {
    if (balances.length === 0) {
      return {
        chainId: getPrimaryChainId(),
        hasSufficientBalance: false,
        selectedBalance: 0n,
        totalBalance: 0n,
      };
    }

    const chainWithSufficientBalance = getChainWithSufficientBalance(
      requiredAmount,
      balancesByChain
    );

    if (chainWithSufficientBalance) {
      const selectedBalance = balancesByChain.get(chainWithSufficientBalance) ?? 0n;
      return {
        chainId: chainWithSufficientBalance,
        hasSufficientBalance: true,
        selectedBalance,
        totalBalance,
      };
    }

    const chainWithHighestBalance = getChainWithHighestBalance(balancesByChain);

    if (chainWithHighestBalance) {
      const selectedBalance = balancesByChain.get(chainWithHighestBalance) ?? 0n;
      return {
        chainId: chainWithHighestBalance,
        hasSufficientBalance: selectedBalance >= requiredAmount,
        selectedBalance,
        totalBalance,
      };
    }

    return {
      chainId: getPrimaryChainId(),
      hasSufficientBalance: false,
      selectedBalance: 0n,
      totalBalance,
    };
  }, [balances, balancesByChain, requiredAmount, totalBalance]);

  return {
    ...result,
    isLoading,
  };
}
