import { useQuery } from '@tanstack/react-query';
import { jbTerminalStoreAbi, JBDAO_CASHOUT_FEE_PERCENT, JBCoreContracts } from 'juice-sdk-core';
import type { CashOutQuoteParams, CashOutQuoteResult } from '@/types/juicebox';
import { getContractAddressForChain } from '@/lib/juicebox/contracts';
import { USDC_DECIMALS, USDC_CURRENCY, type OmnichainChainId } from '@/lib/juicebox/constants';
import { getPrimaryChainId } from '@/lib/juicebox/chain-selection';
import { queryKeys } from '@/lib/query';
import { useJBPublicClient } from './useJBPublicClient';

interface UseJBCashOutQuoteResult {
  quote: CashOutQuoteResult | null;
  isLoading: boolean;
  error: Error | null;
}

function applyJbDaoFee(amount: bigint): bigint {
  return (amount * BigInt(Math.floor((1 - JBDAO_CASHOUT_FEE_PERCENT) * 10000))) / 10000n;
}

export function useJBCashOutQuote(
  params: CashOutQuoteParams | null,
  chainId: OmnichainChainId = getPrimaryChainId()
): UseJBCashOutQuoteResult {
  const publicClient = useJBPublicClient(chainId);
  const terminalStoreAddress = getContractAddressForChain(JBCoreContracts.JBTerminalStore, chainId);

  const query = useQuery({
    queryKey: queryKeys.jb.cashOutQuote(
      params?.projectId?.toString(),
      params?.tokenAmount?.toString(),
      chainId.toString()
    ),
    queryFn: async (): Promise<CashOutQuoteResult> => {
      if (!params) {
        throw new Error('Missing params');
      }

      const grossAmount = await publicClient.readContract({
        address: terminalStoreAddress,
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
