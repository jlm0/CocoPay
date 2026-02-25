import { useState, useCallback } from 'react';
import { encodeFunctionData, type Hex, type Chain } from 'viem';
import { alchemy, type AlchemyTransport } from '@account-kit/infra';
import {
  createModularAccountV2Client,
  type ModularAccountV2Client,
} from '@account-kit/smart-contracts';
import { LocalAccountSigner, type SmartAccountSigner } from '@aa-sdk/core';
import { useParaAccount } from './useParaAccount';
import { getUsdcAddress, type SupportedChainId, ERC20_ABI } from '@/lib/constants';
import { CHAIN_BY_ID } from '@/lib/chains';
import { ALCHEMY_API_KEY, GAS_POLICY_ID } from '@/lib/alchemy';
import { ALCHEMY_AA_CHAINS } from '@/lib/network';
import { invalidateBalances } from '@/lib/query';
import type { WithdrawalQueueItem } from './useWithdrawQueue';

const TX_CONFIRMATION_TIMEOUT_SECONDS = 60;
const POLL_INTERVAL_MS = 1000;

export type WithdrawalResult = {
  chainId: SupportedChainId;
  success: boolean;
  txHash?: Hex;
  error?: string;
};

export type WithdrawalProgress = {
  status: 'idle' | 'pending' | 'partial' | 'success' | 'failed';
  total: number;
  completed: number;
  failed: number;
  results: WithdrawalResult[];
};

type UseMultiChainWithdrawResult = {
  withdraw: (queue: WithdrawalQueueItem[], recipient: Hex) => Promise<WithdrawalResult[]>;
  isLoading: boolean;
  progress: WithdrawalProgress;
  reset: () => void;
};

type AlchemySmartAccountClient = ModularAccountV2Client<
  SmartAccountSigner,
  Chain,
  AlchemyTransport
>;

const initialProgress: WithdrawalProgress = {
  status: 'idle',
  total: 0,
  completed: 0,
  failed: 0,
  results: [],
};

function getAlchemyChain(chain: Chain): Chain {
  return ALCHEMY_AA_CHAINS[chain.id as SupportedChainId] ?? chain;
}

export function useMultiChainWithdraw(): UseMultiChainWithdrawResult {
  const { account } = useParaAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<WithdrawalProgress>(initialProgress);

  const reset = useCallback(() => {
    setProgress(initialProgress);
  }, []);

  const createClientForChain = useCallback(
    async (chain: Chain): Promise<AlchemySmartAccountClient> => {
      if (!account) {
        throw new Error('Account not ready');
      }

      const signer = new LocalAccountSigner(account);
      const transport = alchemy({ apiKey: ALCHEMY_API_KEY });
      const alchemyChain = getAlchemyChain(chain);

      return createModularAccountV2Client({
        transport,
        chain: alchemyChain,
        signer,
        policyId: GAS_POLICY_ID,
        mode: '7702',
      });
    },
    [account]
  );

  const withdraw = useCallback(
    async (queue: WithdrawalQueueItem[], recipient: Hex): Promise<WithdrawalResult[]> => {
      if (queue.length === 0 || !account) {
        return [];
      }

      setIsLoading(true);
      setProgress({
        status: 'pending',
        total: queue.length,
        completed: 0,
        failed: 0,
        results: [],
      });

      const results: WithdrawalResult[] = [];

      const withdrawFromChain = async (item: WithdrawalQueueItem): Promise<WithdrawalResult> => {
        const chain = CHAIN_BY_ID[item.chainId];
        const usdcAddress = getUsdcAddress(item.chainId);

        try {
          const client = await createClientForChain(chain);

          const data = encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'transfer',
            args: [recipient, item.amount],
          });

          const { hash: userOpHash } = await client.sendUserOperation({
            uo: { target: usdcAddress, value: 0n, data },
          });

          let userOpReceipt = await client.getUserOperationReceipt(userOpHash);
          let retries = 0;

          while (!userOpReceipt && retries < TX_CONFIRMATION_TIMEOUT_SECONDS) {
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
            userOpReceipt = await client.getUserOperationReceipt(userOpHash);
            retries++;
          }

          if (!userOpReceipt) {
            throw new Error('Transaction confirmation timed out');
          }

          return {
            chainId: item.chainId,
            success: true,
            txHash: userOpReceipt.receipt.transactionHash as Hex,
          };
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Withdrawal failed';
          return {
            chainId: item.chainId,
            success: false,
            error: errorMessage,
          };
        }
      };

      const withdrawalPromises = queue.map((item) =>
        withdrawFromChain(item).then((result) => {
          results.push(result);
          setProgress((prev) => ({
            ...prev,
            completed: prev.completed + (result.success ? 1 : 0),
            failed: prev.failed + (result.success ? 0 : 1),
            results: [...prev.results, result],
          }));
          return result;
        })
      );

      await Promise.all(withdrawalPromises);

      const successCount = results.filter((r) => r.success).length;
      const failedCount = results.filter((r) => !r.success).length;

      let status: WithdrawalProgress['status'] = 'success';
      if (failedCount === queue.length) {
        status = 'failed';
      } else if (failedCount > 0) {
        status = 'partial';
      }

      setProgress({
        status,
        total: queue.length,
        completed: successCount,
        failed: failedCount,
        results,
      });

      setIsLoading(false);
      invalidateBalances();

      return results;
    },
    [account, createClientForChain]
  );

  return {
    withdraw,
    isLoading,
    progress,
    reset,
  };
}
