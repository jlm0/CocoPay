import { useQuery } from '@tanstack/react-query';
import { getTokenCashOutQuoteEth, applyJbDaoCashOutFee } from 'juice-sdk-core';
import type { CashOutQuoteParams, CashOutQuoteResult } from '@/types/juicebox';
import { useJBProjectRead } from './useJBProjectRead';

interface UseJBCashOutQuoteResult {
  quote: CashOutQuoteResult | null;
  isLoading: boolean;
  error: Error | null;
}

export function useJBCashOutQuote(params: CashOutQuoteParams | null): UseJBCashOutQuoteResult {
  const { project, isLoading: isProjectLoading } = useJBProjectRead(params?.projectId ?? null);

  const query = useQuery({
    queryKey: ['jb-cashout-quote', params?.projectId?.toString(), params?.tokenAmount?.toString()],
    queryFn: (): CashOutQuoteResult => {
      if (!params || !project) {
        throw new Error('Missing params or project data');
      }

      const grossAmount = getTokenCashOutQuoteEth(params.tokenAmount, {
        overflowWei: project.surplus,
        totalSupply: project.totalSupply,
        cashOutTaxRate: project.rulesetMetadata.cashOutTaxRate,
        tokensReserved: 0n,
      });

      if (grossAmount === 0) {
        return {
          tokenAmount: params.tokenAmount,
          grossAmount: 0n,
          cashOutTax: 0n,
          daoFee: 0n,
          netAmount: 0n,
          taxRate: project.rulesetMetadata.cashOutTaxRate / 100,
        };
      }

      const grossAmountBigInt = BigInt(grossAmount);
      const daoFee = applyJbDaoCashOutFee(grossAmountBigInt);
      const cashOutTaxAmount =
        (grossAmountBigInt * BigInt(project.rulesetMetadata.cashOutTaxRate)) / 10000n;
      const netAmount = grossAmountBigInt - daoFee - cashOutTaxAmount;

      return {
        tokenAmount: params.tokenAmount,
        grossAmount: grossAmountBigInt,
        cashOutTax: cashOutTaxAmount,
        daoFee,
        netAmount: netAmount > 0n ? netAmount : 0n,
        taxRate: project.rulesetMetadata.cashOutTaxRate / 100,
      };
    },
    enabled: !!params && !!project && !isProjectLoading,
    staleTime: 10_000,
  });

  return {
    quote: query.data ?? null,
    isLoading: query.isLoading || isProjectLoading,
    error: query.error as Error | null,
  };
}
