import { useState, useCallback, useMemo } from 'react';
import { encodeFunctionData, decodeEventLog, type Hash } from 'viem';
import { jbMultiTerminalAbi } from 'juice-sdk-core';
import type { PayParams, PayResult } from '@/types/juicebox';
import { useAlchemySendTransaction } from '@/hooks/useAlchemySendTransaction';
import { useParaAccount } from '@/hooks/useParaAccount';
import { DEFAULT_MEMO, DEFAULT_METADATA, type OmnichainChainId } from '@/lib/juicebox/constants';
import {
  getPrimaryChainId,
  getChainById,
  getUsdcAddress,
  getMultiTerminalAddress,
} from '@/lib/juicebox/chain-selection';

interface UseJBPayResult {
  pay: (params: PayParams) => Promise<PayResult>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useJBPay(
  projectId: bigint,
  chainId: OmnichainChainId = getPrimaryChainId()
): UseJBPayResult {
  const { address } = useParaAccount();
  const chain = getChainById(chainId);
  const { sendTransaction, isLoading, isReady } = useAlchemySendTransaction(chain);

  const terminalAddress = useMemo(() => getMultiTerminalAddress(chainId), [chainId]);
  const usdcAddress = useMemo(() => getUsdcAddress(chainId), [chainId]);

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
          args: [projectId, usdcAddress, params.amount, beneficiary, 0n, memo, DEFAULT_METADATA],
        });

        const result = await sendTransaction(terminalAddress, 0n, data);
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
          } catch (err) {
            if (__DEV__) {
              console.warn('[useJBPay] Failed to decode event log:', err);
            }
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
    [address, isReady, projectId, usdcAddress, terminalAddress, sendTransaction]
  );

  return {
    pay,
    isLoading,
    error,
    reset,
  };
}
