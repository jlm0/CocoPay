import { useQuery } from '@tanstack/react-query';
import { revLoans1_1Abi, calcPrepaidFee, getRevnetLoanContract } from 'juice-sdk-core';
import type { LoanQuoteParams, LoanQuoteResult } from '@/types/juicebox';
import {
  JB_VERSION,
  COCOPAY_CHAIN_ID,
  USDC_DECIMALS,
  USDC_CURRENCY,
} from '@/lib/juicebox/constants';
import { queryKeys } from '@/lib/query';
import { useJBPublicClient } from './useJBPublicClient';

interface UseJBLoanQuoteResult {
  quote: LoanQuoteResult | null;
  isLoading: boolean;
  error: Error | null;
}

export function useJBLoanQuote(params: LoanQuoteParams | null): UseJBLoanQuoteResult {
  const publicClient = useJBPublicClient();

  const query = useQuery({
    queryKey: queryKeys.jb.loanQuote(
      params?.projectId?.toString(),
      params?.collateralAmount?.toString()
    ),
    queryFn: async (): Promise<LoanQuoteResult> => {
      if (!params) {
        throw new Error('Missing params');
      }

      const loanContractAddress = getRevnetLoanContract(JB_VERSION, COCOPAY_CHAIN_ID);

      const borrowableAmount = await publicClient.readContract({
        address: loanContractAddress,
        abi: revLoans1_1Abi,
        functionName: 'borrowableAmountFrom',
        args: [
          params.projectId,
          params.collateralAmount,
          BigInt(USDC_DECIMALS),
          BigInt(USDC_CURRENCY),
        ],
      });

      const minFeePercent = await publicClient.readContract({
        address: loanContractAddress,
        abi: revLoans1_1Abi,
        functionName: 'MIN_PREPAID_FEE_PERCENT',
      });

      const maxFeePercent = await publicClient.readContract({
        address: loanContractAddress,
        abi: revLoans1_1Abi,
        functionName: 'MAX_PREPAID_FEE_PERCENT',
      });

      return {
        collateralAmount: params.collateralAmount,
        borrowableAmount,
        minFeePercent: Number(minFeePercent),
        maxFeePercent: Number(maxFeePercent),
      };
    },
    enabled: !!params && params.collateralAmount > 0n,
    staleTime: 30_000,
  });

  return {
    quote: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}

export { calcPrepaidFee };
