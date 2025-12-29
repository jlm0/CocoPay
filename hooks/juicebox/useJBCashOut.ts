import { useState, useCallback, useMemo } from 'react';
import { encodeFunctionData, type Hash } from 'viem';
import { jbMultiTerminalAbi } from 'juice-sdk-core';
import type { CashOutParams, CashOutResult } from '@/types/juicebox';
import { useAlchemySendTransaction } from '@/hooks/useAlchemySendTransaction';
import { useParaAccount } from '@/hooks/useParaAccount';
import { DEFAULT_METADATA, type OmnichainChainId } from '@/lib/juicebox/constants';
import {
  getPrimaryChainId,
  getChainById,
  getUsdcAddress,
  getMultiTerminalAddress,
} from '@/lib/juicebox/chain-selection';

interface UseJBCashOutResult {
  cashOut: (params: CashOutParams) => Promise<CashOutResult>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useJBCashOut(
  projectId: bigint,
  chainId: OmnichainChainId = getPrimaryChainId()
): UseJBCashOutResult {
  const { address } = useParaAccount();
  const chain = getChainById(chainId);
  const { sendTransaction, isLoading, isReady } = useAlchemySendTransaction(chain);

  const terminalAddress = useMemo(() => getMultiTerminalAddress(chainId), [chainId]);
  const usdcAddress = useMemo(() => getUsdcAddress(chainId), [chainId]);

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
            usdcAddress,
            params.minReceived,
            beneficiary,
            DEFAULT_METADATA,
          ],
        });

        const result = await sendTransaction(terminalAddress, 0n, data);
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
    [address, isReady, projectId, usdcAddress, terminalAddress, sendTransaction]
  );

  return {
    cashOut,
    isLoading,
    error,
    reset,
  };
}
