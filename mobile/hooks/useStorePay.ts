import { useState, useCallback, useMemo } from 'react';
import { encodeFunctionData, decodeEventLog, type Hash } from 'viem';
import { jbMultiTerminalAbi, jbControllerAbi, JBCoreContracts } from 'juice-sdk-core';
import type { PayParams, PayResult } from '@/types/juicebox';
import { useAlchemySendTransaction } from '@/hooks/useAlchemySendTransaction';
import { useParaAccount } from '@/hooks/useParaAccount';
import { useUsdcAllowance } from '@/hooks/useUsdcAllowance';
import { DEFAULT_MEMO, DEFAULT_METADATA, type OmnichainChainId } from '@/lib/juicebox/constants';
import { getContractAddressForChain } from '@/lib/juicebox/contracts';
import {
  getPrimaryChainId,
  getChainById,
  getUsdcAddress,
  getMultiTerminalAddress,
} from '@/lib/juicebox/chain-selection';
import { ERC20_ABI, USDC_APPROVAL_AMOUNT } from '@/lib/constants';

export type PaymentStep = 'idle' | 'approving' | 'sending' | 'confirming';

interface UseStorePayResult {
  pay: (params: PayParams) => Promise<PayResult>;
  isLoading: boolean;
  paymentStep: PaymentStep;
  error: Error | null;
  needsApproval: boolean;
  reset: () => void;
}

export function useStorePay(
  projectId: bigint,
  chainId: OmnichainChainId = getPrimaryChainId()
): UseStorePayResult {
  const { address } = useParaAccount();
  const chain = getChainById(chainId);
  const { sendBatchedTransaction, isLoading, isReady } = useAlchemySendTransaction(chain);

  const terminalAddress = useMemo(() => getMultiTerminalAddress(chainId), [chainId]);
  const usdcAddress = useMemo(() => getUsdcAddress(chainId), [chainId]);
  const controllerAddress = useMemo(
    () => getContractAddressForChain(JBCoreContracts.JBController, chainId),
    [chainId]
  );

  const { data: allowance, refetch: refetchAllowance } = useUsdcAllowance(terminalAddress);
  const [error, setError] = useState<Error | null>(null);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('idle');

  const needsApproval = !allowance || allowance < USDC_APPROVAL_AMOUNT / 10n;

  const reset = useCallback(() => {
    setError(null);
    setPaymentStep('idle');
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

        const payData = encodeFunctionData({
          abi: jbMultiTerminalAbi,
          functionName: 'pay',
          args: [projectId, usdcAddress, params.amount, beneficiary, 0n, memo, DEFAULT_METADATA],
        });

        const claimReservedData = encodeFunctionData({
          abi: jbControllerAbi,
          functionName: 'sendReservedTokensToSplitsOf',
          args: [projectId],
        });

        const requiresApproval = !allowance || allowance < params.amount;

        let result;

        if (requiresApproval) {
          setPaymentStep('approving');
          const approveData = encodeFunctionData({
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [terminalAddress, USDC_APPROVAL_AMOUNT],
          });

          setPaymentStep('sending');
          result = await sendBatchedTransaction([
            { target: usdcAddress, data: approveData },
            { target: terminalAddress, data: payData },
            { target: controllerAddress, data: claimReservedData },
          ]);

          refetchAllowance();
        } else {
          setPaymentStep('sending');
          result = await sendBatchedTransaction([
            { target: terminalAddress, data: payData },
            { target: controllerAddress, data: claimReservedData },
          ]);
        }

        setPaymentStep('confirming');
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
              console.warn('[useStorePay] Failed to decode event log:', err);
            }
            continue;
          }
        }

        setPaymentStep('idle');
        return {
          tokensReceived,
          txHash,
        };
      } catch (err) {
        setPaymentStep('idle');
        const error = err instanceof Error ? err : new Error('Payment failed');
        setError(error);
        throw error;
      }
    },
    [
      address,
      isReady,
      projectId,
      allowance,
      usdcAddress,
      terminalAddress,
      controllerAddress,
      sendBatchedTransaction,
      refetchAllowance,
    ]
  );

  return {
    pay,
    isLoading,
    paymentStep,
    error,
    needsApproval,
    reset,
  };
}
