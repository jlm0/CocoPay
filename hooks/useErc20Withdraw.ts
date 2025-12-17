import { useState, useCallback } from 'react';
import { encodeFunctionData, type Hex } from 'viem';
import { useAlchemySendTransaction } from './useAlchemySendTransaction';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { ERC20_ABI } from '@/lib/constants';

type WithdrawResult = {
  txHash: Hex;
};

type UseErc20WithdrawResult = {
  withdraw: (to: Hex, amount: bigint) => Promise<WithdrawResult>;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
  reset: () => void;
};

export function useErc20Withdraw(tokenAddress: Hex): UseErc20WithdrawResult {
  const { sendTransaction, isLoading, isReady } = useAlchemySendTransaction(DEFAULT_CHAIN);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const withdraw = useCallback(
    async (to: Hex, amount: bigint): Promise<WithdrawResult> => {
      if (!isReady) {
        throw new Error('Transaction client not ready');
      }

      setError(null);

      try {
        const data = encodeFunctionData({
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [to, amount],
        });

        const receipt = await sendTransaction(tokenAddress, 0n, data);
        const txHash = receipt.receipt.transactionHash as Hex;

        return { txHash };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Withdrawal failed');
        setError(error);
        throw error;
      }
    },
    [isReady, sendTransaction, tokenAddress]
  );

  return {
    withdraw,
    isLoading,
    error,
    isReady,
    reset,
  };
}
