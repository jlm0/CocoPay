import { useQuery } from '@tanstack/react-query';
import { revLoans1_1Abi, getRevnetLoanContract } from 'juice-sdk-core';
import type { Loan } from '@/types/juicebox';
import { JB_VERSION, COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import { useJBPublicClient } from './useJBPublicClient';

interface UseJBLoanReadResult {
  loan: Loan | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useJBLoanRead(loanId: bigint | null): UseJBLoanReadResult {
  const publicClient = useJBPublicClient();

  const query = useQuery({
    queryKey: ['jb-loan', loanId?.toString()],
    queryFn: async (): Promise<Loan> => {
      if (!loanId) {
        throw new Error('Loan ID is required');
      }

      const loanContractAddress = getRevnetLoanContract(JB_VERSION, COCOPAY_CHAIN_ID);

      const loanData = await publicClient.readContract({
        address: loanContractAddress,
        abi: revLoans1_1Abi,
        functionName: 'loanOf',
        args: [loanId],
      });

      return {
        id: loanId,
        amount: loanData.amount,
        collateral: loanData.collateral,
        createdAt: Number(loanData.createdAt),
        prepaidFeePercent: Number(loanData.prepaidFeePercent),
        prepaidDuration: Number(loanData.prepaidDuration),
        source: {
          token: loanData.source.token,
          terminal: loanData.source.terminal,
        },
      };
    },
    enabled: !!loanId,
    staleTime: 30_000,
  });

  return {
    loan: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
