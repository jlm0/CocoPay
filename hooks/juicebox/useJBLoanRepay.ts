import { useState, useCallback } from 'react';
import { encodeFunctionData, type Hash, zeroAddress } from 'viem';
import { revLoans1_1Abi, getRevnetLoanContract } from 'juice-sdk-core';
import type { LoanRepayParams, LoanRepayResult } from '@/types/juicebox';
import { useAlchemySendTransaction } from '@/hooks/useAlchemySendTransaction';
import { useParaAccount } from '@/hooks/useParaAccount';
import { COCOPAY_CHAIN, JB_VERSION, COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';

interface UseJBLoanRepayResult {
  repay: (params: LoanRepayParams) => Promise<LoanRepayResult>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useJBLoanRepay(): UseJBLoanRepayResult {
  const { address } = useParaAccount();
  const { sendTransaction, isLoading, isReady } = useAlchemySendTransaction(COCOPAY_CHAIN);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const repay = useCallback(
    async (params: LoanRepayParams): Promise<LoanRepayResult> => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!isReady) {
        throw new Error('Transaction client not ready');
      }

      setError(null);

      try {
        const loanContractAddress = getRevnetLoanContract(JB_VERSION, COCOPAY_CHAIN_ID);
        const beneficiary = params.beneficiary ?? address;

        const allowance = {
          token: zeroAddress,
          amount: 0n,
          expiration: 0,
          nonce: 0,
          sigDeadline: 0n,
          signature: '0x' as `0x${string}`,
        };

        const data = encodeFunctionData({
          abi: revLoans1_1Abi,
          functionName: 'repayLoan',
          args: [
            params.loanId,
            params.maxRepayAmount,
            params.collateralToReturn,
            beneficiary,
            allowance,
          ],
        });

        const receipt = await sendTransaction(loanContractAddress, 0n, data);
        const txHash = receipt.receipt.transactionHash as Hash;

        return {
          txHash,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Repay failed');
        setError(error);
        throw error;
      }
    },
    [address, isReady, sendTransaction]
  );

  return {
    repay,
    isLoading,
    error,
    reset,
  };
}
