import { useState, useCallback, useMemo } from 'react';
import { formatUnits } from 'viem';
import { TOKEN_DECIMALS, type SupportedChainId } from '@/lib/constants';

export type WithdrawalQueueItem = {
  chainId: SupportedChainId;
  amount: bigint;
};

export type UseWithdrawQueueResult = {
  queue: WithdrawalQueueItem[];
  addToQueue: (chainId: SupportedChainId, amount: bigint) => void;
  removeFromQueue: (chainId: SupportedChainId) => void;
  updateInQueue: (chainId: SupportedChainId, amount: bigint) => void;
  clearQueue: () => void;
  totalAmount: bigint;
  totalFormatted: string;
  isInQueue: (chainId: SupportedChainId) => boolean;
  getQueuedAmount: (chainId: SupportedChainId) => bigint | undefined;
};

export function useWithdrawQueue(): UseWithdrawQueueResult {
  const [queue, setQueue] = useState<WithdrawalQueueItem[]>([]);

  const addToQueue = useCallback((chainId: SupportedChainId, amount: bigint) => {
    setQueue((prev) => {
      const existing = prev.find((item) => item.chainId === chainId);
      if (existing) {
        return prev.map((item) => (item.chainId === chainId ? { ...item, amount } : item));
      }
      return [...prev, { chainId, amount }];
    });
  }, []);

  const removeFromQueue = useCallback((chainId: SupportedChainId) => {
    setQueue((prev) => prev.filter((item) => item.chainId !== chainId));
  }, []);

  const updateInQueue = useCallback((chainId: SupportedChainId, amount: bigint) => {
    setQueue((prev) => prev.map((item) => (item.chainId === chainId ? { ...item, amount } : item)));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const totalAmount = useMemo(() => {
    return queue.reduce((sum, item) => sum + item.amount, 0n);
  }, [queue]);

  const totalFormatted = useMemo(() => {
    return formatUnits(totalAmount, TOKEN_DECIMALS.USDC);
  }, [totalAmount]);

  const isInQueue = useCallback(
    (chainId: SupportedChainId) => {
      return queue.some((item) => item.chainId === chainId);
    },
    [queue]
  );

  const getQueuedAmount = useCallback(
    (chainId: SupportedChainId) => {
      return queue.find((item) => item.chainId === chainId)?.amount;
    },
    [queue]
  );

  return {
    queue,
    addToQueue,
    removeFromQueue,
    updateInQueue,
    clearQueue,
    totalAmount,
    totalFormatted,
    isInQueue,
    getQueuedAmount,
  };
}
