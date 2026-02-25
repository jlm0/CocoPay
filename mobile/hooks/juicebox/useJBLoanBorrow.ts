import { useState, useCallback } from 'react';
import { encodeFunctionData, type Hash } from 'viem';
import { revLoans1_1Abi, getRevnetLoanContract } from 'juice-sdk-core';
import type { LoanBorrowParams, LoanBorrowResult, Loan } from '@/types/juicebox';
import { useAlchemySendTransaction } from '@/hooks/useAlchemySendTransaction';
import { useParaAccount } from '@/hooks/useParaAccount';
import { JB_VERSION, type OmnichainChainId } from '@/lib/juicebox/constants';
import {
  getPrimaryChainId,
  getChainById,
  getUsdcAddress,
  getMultiTerminalAddress,
} from '@/lib/juicebox/chain-selection';

interface UseJBLoanBorrowResult {
  borrow: (params: LoanBorrowParams) => Promise<LoanBorrowResult>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useJBLoanBorrow(
  projectId: bigint,
  chainId: OmnichainChainId = getPrimaryChainId()
): UseJBLoanBorrowResult {
  const { address } = useParaAccount();
  const chain = getChainById(chainId);
  const { sendTransaction, isLoading, isReady } = useAlchemySendTransaction(chain);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const borrow = useCallback(
    async (params: LoanBorrowParams): Promise<LoanBorrowResult> => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!isReady) {
        throw new Error('Transaction client not ready');
      }

      setError(null);

      try {
        const loanContractAddress = getRevnetLoanContract(JB_VERSION, chainId);
        const beneficiary = params.beneficiary ?? address;

        const loanSource = {
          token: getUsdcAddress(chainId),
          terminal: getMultiTerminalAddress(chainId),
        };

        const data = encodeFunctionData({
          abi: revLoans1_1Abi,
          functionName: 'borrowFrom',
          args: [
            projectId,
            loanSource,
            params.minBorrowAmount,
            params.collateralAmount,
            beneficiary,
            BigInt(params.prepaidFeePercent),
          ],
        });

        const result = await sendTransaction(loanContractAddress, 0n, data);
        const txHash = result.receipt.transactionHash as Hash;

        let loanId = 0n;
        for (const log of result.receipt.logs) {
          if (log.topics[1]) {
            loanId = BigInt(log.topics[1]);
            break;
          }
        }

        const loan: Loan = {
          id: loanId,
          amount: params.minBorrowAmount,
          collateral: params.collateralAmount,
          createdAt: Math.floor(Date.now() / 1000),
          prepaidFeePercent: params.prepaidFeePercent,
          prepaidDuration: 0,
          source: loanSource,
        };

        return {
          loan,
          txHash,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Borrow failed');
        setError(error);
        throw error;
      }
    },
    [address, isReady, projectId, chainId, sendTransaction]
  );

  return {
    borrow,
    isLoading,
    error,
    reset,
  };
}
