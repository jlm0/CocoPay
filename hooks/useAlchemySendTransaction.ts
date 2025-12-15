import { useCallback, useState } from 'react';
import type { Hex, Chain, TransactionReceipt } from 'viem';
import { useAlchemySmartAccountClient } from './useAlchemySmartAccountClient';
import { invalidateBalances } from '@/lib/query';

export interface SendTransactionResult {
  receipt: TransactionReceipt;
  userOpHash: Hex;
}

export interface UserOperation {
  target: Hex;
  value?: bigint;
  data?: Hex;
}

export function useAlchemySendTransaction(chain?: Chain) {
  const client = useAlchemySmartAccountClient(chain);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = useCallback(
    async (to: Hex, value: bigint = 0n, data: Hex = '0x'): Promise<SendTransactionResult> => {
      if (!client) throw new Error('Smart account client not ready');

      setIsLoading(true);
      setError(null);

      try {
        const { hash: userOpHash } = await client.sendUserOperation({
          uo: { target: to, value, data },
        });

        let userOpReceipt = await client.getUserOperationReceipt(userOpHash);
        while (!userOpReceipt) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          userOpReceipt = await client.getUserOperationReceipt(userOpHash);
        }

        invalidateBalances();

        return {
          receipt: userOpReceipt.receipt,
          userOpHash,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const sendBatchedTransaction = useCallback(
    async (operations: UserOperation[]): Promise<SendTransactionResult> => {
      if (!client) throw new Error('Smart account client not ready');

      setIsLoading(true);
      setError(null);

      try {
        const uo = operations.map((op) => ({
          target: op.target,
          value: op.value ?? 0n,
          data: op.data ?? '0x',
        }));

        const { hash: userOpHash } = await client.sendUserOperation({ uo });

        let userOpReceipt = await client.getUserOperationReceipt(userOpHash);
        while (!userOpReceipt) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          userOpReceipt = await client.getUserOperationReceipt(userOpHash);
        }

        invalidateBalances();

        return {
          receipt: userOpReceipt.receipt,
          userOpHash,
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  return { sendTransaction, sendBatchedTransaction, isLoading, error, isReady: !!client };
}
