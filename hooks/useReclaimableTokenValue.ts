import { useMemo, useCallback } from 'react';
import { useQueries } from '@tanstack/react-query';
import { createPublicClient, http, formatUnits } from 'viem';
import { jbTerminalStoreAbi, JBCoreContracts } from 'juice-sdk-core';
import { useMultiChainParticipations } from './useMultiChainParticipations';
import { getContractAddressForChain } from '@/lib/juicebox/contracts';
import { USDC_DECIMALS, USDC_CURRENCY } from '@/lib/juicebox/constants';
import { getAlchemyRpcUrl } from '@/lib/alchemy';
import { CHAIN_BY_ID, type SupportedChainId } from '@/lib/chains';
import { TOKEN_DECIMALS } from '@/lib/constants';
import { queryKeys } from '@/lib/query';

const RECLAIMABLE_STALE_TIME = 30_000;

export type ReclaimableBalance = {
  projectId: number;
  chainId: number;
  tokenBalance: bigint;
  reclaimableUsdc: bigint;
  reclaimableFormatted: string;
};

export type UseReclaimableTokenValueResult = {
  balances: ReclaimableBalance[];
  totalReclaimableUsdc: bigint;
  totalReclaimableFormatted: string;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useReclaimableTokenValue(): UseReclaimableTokenValueResult {
  const { participations, isLoading: participationsLoading } = useMultiChainParticipations();

  const queries = useQueries({
    queries: participations.map((participation) => ({
      queryKey: queryKeys.multiChain.reclaimableByProject(
        participation.projectId,
        participation.chainId,
        participation.balance
      ),
      queryFn: async (): Promise<ReclaimableBalance> => {
        const chain = CHAIN_BY_ID[participation.chainId as SupportedChainId];
        if (!chain) {
          throw new Error(`Unsupported chain: ${participation.chainId}`);
        }

        const client = createPublicClient({
          chain,
          transport: http(getAlchemyRpcUrl(chain)),
        });

        const terminalStoreAddress = getContractAddressForChain(
          JBCoreContracts.JBTerminalStore,
          participation.chainId
        );

        const tokenBalance = BigInt(participation.balance);

        const reclaimableUsdc = await client.readContract({
          address: terminalStoreAddress,
          abi: jbTerminalStoreAbi,
          functionName: 'currentReclaimableSurplusOf',
          args: [
            BigInt(participation.projectId),
            tokenBalance,
            [],
            [],
            BigInt(USDC_DECIMALS),
            BigInt(USDC_CURRENCY),
          ],
        });

        return {
          projectId: participation.projectId,
          chainId: participation.chainId,
          tokenBalance,
          reclaimableUsdc,
          reclaimableFormatted: formatUnits(reclaimableUsdc, TOKEN_DECIMALS.USDC),
        };
      },
      enabled: participations.length > 0 && !participationsLoading,
      staleTime: RECLAIMABLE_STALE_TIME,
    })),
  });

  const balances = useMemo(() => {
    return queries.filter((q) => q.data !== undefined).map((q) => q.data as ReclaimableBalance);
  }, [queries]);

  const totalReclaimableUsdc = useMemo(() => {
    return balances.reduce((sum, b) => sum + b.reclaimableUsdc, 0n);
  }, [balances]);

  const totalReclaimableFormatted = useMemo(() => {
    return formatUnits(totalReclaimableUsdc, TOKEN_DECIMALS.USDC);
  }, [totalReclaimableUsdc]);

  const isLoading = participationsLoading || queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);

  const error = useMemo(() => {
    const firstError = queries.find((q) => q.error)?.error;
    return firstError ? (firstError as Error) : null;
  }, [queries]);

  const refetch = useCallback(() => {
    queries.forEach((q) => q.refetch());
  }, [queries]);

  return {
    balances,
    totalReclaimableUsdc,
    totalReclaimableFormatted,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
