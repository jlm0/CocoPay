import { useState, useCallback } from 'react';
import { encodeFunctionData, decodeEventLog, type Hash, type Address } from 'viem';
import { jbMultiTerminalAbi } from 'juice-sdk-core';
import type { PayParams, PayResult } from '@/types/juicebox';
import { useAlchemySendTransaction } from '@/hooks/useAlchemySendTransaction';
import { useParaAccount } from '@/hooks/useParaAccount';
import {
  COCOPAY_CHAIN,
  USDC_ADDRESS,
  DEFAULT_MEMO,
  DEFAULT_METADATA,
} from '@/lib/juicebox/constants';
import { JB_MULTI_TERMINAL_ADDRESS } from '@/lib/juicebox/contracts';

interface UseJBPayResult {
  pay: (params: PayParams) => Promise<PayResult>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useJBPay(projectId: bigint): UseJBPayResult {
  const { address } = useParaAccount();
  const { sendTransaction, isLoading, isReady } = useAlchemySendTransaction(COCOPAY_CHAIN);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const pay = useCallback(
    async (params: PayParams): Promise<PayResult> => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!isReady) {
        throw new Error('Transaction client not ready');
      }

      setError(null);

      try {
        const beneficiary = params.beneficiary ?? address;
        const memo = params.memo ?? DEFAULT_MEMO;

        const data = encodeFunctionData({
          abi: jbMultiTerminalAbi,
          functionName: 'pay',
          args: [
            projectId,
            USDC_ADDRESS as Address,
            params.amount,
            beneficiary,
            0n,
            memo,
            DEFAULT_METADATA,
          ],
        });

        const result = await sendTransaction(JB_MULTI_TERMINAL_ADDRESS, 0n, data);
        const txHash = result.receipt.transactionHash as Hash;

        let tokensReceived = 0n;
        for (const log of result.receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: jbMultiTerminalAbi,
              data: log.data,
              topics: log.topics as [Hash, ...Hash[]],
            });
            if (decoded.eventName === 'Pay' && 'newlyIssuedTokenCount' in decoded.args) {
              tokensReceived = decoded.args.newlyIssuedTokenCount as bigint;
              break;
            }
          } catch {
            continue;
          }
        }

        return {
          tokensReceived,
          txHash,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Payment failed');
        setError(error);
        throw error;
      }
    },
    [address, isReady, projectId, sendTransaction]
  );

  return {
    pay,
    isLoading,
    error,
    reset,
  };
}
