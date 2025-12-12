import { useQuery } from '@tanstack/react-query';
import { getTokenAToBQuote, ReservedPercent, RulesetWeight, Ether } from 'juice-sdk-core';
import type { PayQuoteParams, PayQuoteResult } from '@/types/juicebox';
import { useJBProjectRead } from './useJBProjectRead';

interface UseJBPayQuoteResult {
  quote: PayQuoteResult | null;
  isLoading: boolean;
  error: Error | null;
}

export function useJBPayQuote(params: PayQuoteParams | null): UseJBPayQuoteResult {
  const { project, isLoading: isProjectLoading } = useJBProjectRead(params?.projectId ?? null);

  const query = useQuery({
    queryKey: ['jb-pay-quote', params?.projectId?.toString(), params?.paymentAmount?.toString()],
    queryFn: (): PayQuoteResult => {
      if (!params || !project) {
        throw new Error('Missing params or project data');
      }

      const weight = new RulesetWeight(project.ruleset.weight);
      const reservedPercent = new ReservedPercent(project.rulesetMetadata.reservedPercent);

      const paymentEther = new Ether(params.paymentAmount);

      const quoteResult = getTokenAToBQuote(paymentEther, {
        weight,
        reservedPercent,
      });

      const tokensToReceive = quoteResult.payerTokens;
      const tokensReserved = quoteResult.reservedTokens;
      const totalTokensMinted = quoteResult.totalTokens;

      const effectiveRate =
        params.paymentAmount > 0n ? Number(tokensToReceive) / Number(params.paymentAmount) : 0;

      return {
        paymentAmount: params.paymentAmount,
        tokensToReceive,
        tokensReserved,
        totalTokensMinted,
        effectiveRate,
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
