import { useQuery } from '@tanstack/react-query';
import { jbTerminalStoreAbi, JBDAO_CASHOUT_FEE_PERCENT } from 'juice-sdk-core';
import type { CashOutQuoteParams, CashOutQuoteResult } from '@/types/juicebox';
import { JB_TERMINAL_STORE_ADDRESS } from '@/lib/juicebox/contracts';
import { USDC_DECIMALS, USDC_CURRENCY } from '@/lib/juicebox/constants';
import { useJBPublicClient } from './useJBPublicClient';

interface UseJBCashOutQuoteResult {
  quote: CashOutQuoteResult | null;
  isLoading: boolean;
  error: Error | null;
}

function applyJbDaoFee(amount: bigint): bigint {
  return (amount * BigInt(Math.floor((1 - JBDAO_CASHOUT_FEE_PERCENT) * 10000))) / 10000n;
}

export function useJBCashOutQuote(params: CashOutQuoteParams | null): UseJBCashOutQuoteResult {
  const publicClient = useJBPublicClient();

  const query = useQuery({
    queryKey: ['jb-cashout-quote', params?.projectId?.toString(), params?.tokenAmount?.toString()],
    queryFn: async (): Promise<CashOutQuoteResult> => {
      if (!params) {
        throw new Error('Missing params');
      }

      const grossAmount = await publicClient.readContract({
        address: JB_TERMINAL_STORE_ADDRESS,
        abi: jbTerminalStoreAbi,
        functionName: 'currentReclaimableSurplusOf',
        args: [
          params.projectId,
          params.tokenAmount,
          [],
          [],
          BigInt(USDC_DECIMALS),
          BigInt(USDC_CURRENCY),
        ],
      });

      if (grossAmount === 0n) {
        return {
          tokenAmount: params.tokenAmount,
          grossAmount: 0n,
          cashOutTax: 0n,
          daoFee: 0n,
          netAmount: 0n,
          taxRate: 0,
        };
      }

      const netAmount = applyJbDaoFee(grossAmount);
      const daoFee = grossAmount - netAmount;

      return {
        tokenAmount: params.tokenAmount,
        grossAmount,
        cashOutTax: 0n,
        daoFee,
        netAmount,
        taxRate: 0,
      };
    },
    enabled: !!params && params.tokenAmount > 0n,
    staleTime: 10_000,
  });

  return {
    quote: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
  };
}
