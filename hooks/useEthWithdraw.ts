import { useState, useCallback } from 'react';
import type { Hex } from 'viem';
import { useAlchemySendTransaction } from './useAlchemySendTransaction';
import { DEFAULT_CHAIN } from '@/lib/chains';

type WithdrawResult = {
  txHash: Hex;
};

type UseEthWithdrawResult = {
  withdraw: (to: Hex, value: bigint) => Promise<WithdrawResult>;
  isLoading: boolean;
  error: Error | null;
  isReady: boolean;
  reset: () => void;
};

export function useEthWithdraw(): UseEthWithdrawResult {
  const { sendTransaction, isLoading, isReady } = useAlchemySendTransaction(DEFAULT_CHAIN);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const withdraw = useCallback(
    async (to: Hex, value: bigint): Promise<WithdrawResult> => {
      if (!isReady) {
        throw new Error('Transaction client not ready');
      }

      setError(null);

      try {
        const receipt = await sendTransaction(to, value, '0x');
        const txHash = receipt.receipt.transactionHash as Hex;

        return { txHash };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Withdrawal failed');
        setError(error);
        throw error;
      }
    },
    [isReady, sendTransaction]
  );

  return {
    withdraw,
    isLoading,
    error,
    isReady,
    reset,
  };
}
