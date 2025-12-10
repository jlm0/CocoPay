import { useCallback, useState } from 'react';
import type { Hex, Chain } from 'viem';
import { useAlchemySmartAccountClient } from './useAlchemySmartAccountClient';

export function useAlchemySendTransaction(chain?: Chain) {
  const client = useAlchemySmartAccountClient(chain);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendTransaction = useCallback(
    async (to: Hex, value: bigint = 0n, data: Hex = '0x') => {
      if (!client) throw new Error('Smart account client not ready');

      setIsLoading(true);
      setError(null);

      try {
        const { hash } = await client.sendUserOperation({
          uo: { target: to, value, data },
        });
        const receipt = await client.waitForUserOperationReceipt({ hash });
        return receipt;
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

  return { sendTransaction, isLoading, error, isReady: !!client };
}
