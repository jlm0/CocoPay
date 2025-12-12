import { useState, useCallback } from 'react';
import { encodeFunctionData, type Hash, type Address } from 'viem';
import { jbMultiTerminalAbi } from 'juice-sdk-core';
import type { CashOutParams, CashOutResult } from '@/types/juicebox';
import { useAlchemySendTransaction } from '@/hooks/useAlchemySendTransaction';
import { useParaAccount } from '@/hooks/useParaAccount';
import { COCOPAY_CHAIN, USDC_ADDRESS, DEFAULT_METADATA } from '@/lib/juicebox/constants';
import { JB_MULTI_TERMINAL_ADDRESS } from '@/lib/juicebox/contracts';

interface UseJBCashOutResult {
  cashOut: (params: CashOutParams) => Promise<CashOutResult>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useJBCashOut(projectId: bigint): UseJBCashOutResult {
  const { address } = useParaAccount();
  const { sendTransaction, isLoading, isReady } = useAlchemySendTransaction(COCOPAY_CHAIN);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const cashOut = useCallback(
    async (params: CashOutParams): Promise<CashOutResult> => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!isReady) {
        throw new Error('Transaction client not ready');
      }

      setError(null);

      try {
        const beneficiary = params.beneficiary ?? address;

        const data = encodeFunctionData({
          abi: jbMultiTerminalAbi,
          functionName: 'cashOutTokensOf',
          args: [
            address,
            projectId,
            params.tokenAmount,
            USDC_ADDRESS as Address,
            params.minReceived,
            beneficiary,
            DEFAULT_METADATA,
          ],
        });

        const result = await sendTransaction(JB_MULTI_TERMINAL_ADDRESS, 0n, data);
        const txHash = result.receipt.transactionHash as Hash;

        let amountReceived = 0n;
        for (const log of result.receipt.logs) {
          if (
            log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
          ) {
            if (log.data && log.data.length >= 66) {
              amountReceived = BigInt(log.data);
            }
          }
        }

        return {
          amountReceived,
          txHash,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Cash out failed');
        setError(error);
        throw error;
      }
    },
    [address, isReady, projectId, sendTransaction]
  );

  return {
    cashOut,
    isLoading,
    error,
    reset,
  };
}
