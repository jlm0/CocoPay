import { useMemo, useCallback } from 'react';
import { useMultiChainUsdcBalance, type ChainBalance } from './useMultiChainUsdcBalance';
import { useReclaimableTokenValue, type ReclaimableBalance } from './useReclaimableTokenValue';

export type UseUnifiedUsdBalanceResult = {
  totalUsdc: number;
  totalReclaimable: number;
  totalUsd: number;
  usdcByChain: ChainBalance[];
  reclaimableByProject: ReclaimableBalance[];
  hasData: boolean;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => void;
};

export function useUnifiedUsdBalance(): UseUnifiedUsdBalanceResult {
  const {
    balances: usdcByChain,
    totalFormatted: totalUsdcFormatted,
    hasData: usdcHasData,
    isLoading: usdcLoading,
    isFetching: usdcFetching,
    error: usdcError,
    refetch: refetchUsdc,
  } = useMultiChainUsdcBalance();

  const {
    balances: reclaimableByProject,
    totalReclaimableFormatted,
    hasData: reclaimableHasData,
    isLoading: reclaimableLoading,
    isFetching: reclaimableFetching,
    error: reclaimableError,
    refetch: refetchReclaimable,
  } = useReclaimableTokenValue();

  const totalUsdc = useMemo(() => {
    return parseFloat(totalUsdcFormatted) || 0;
  }, [totalUsdcFormatted]);

  const totalReclaimable = useMemo(() => {
    return parseFloat(totalReclaimableFormatted) || 0;
  }, [totalReclaimableFormatted]);

  const totalUsd = useMemo(() => {
    return totalUsdc + totalReclaimable;
  }, [totalUsdc, totalReclaimable]);

  const hasData = usdcHasData || reclaimableHasData;
  const isLoading = (usdcLoading || reclaimableLoading) && !hasData;
  const isFetching = usdcFetching || reclaimableFetching;

  const error = useMemo(() => {
    return usdcError || reclaimableError;
  }, [usdcError, reclaimableError]);

  const refetch = useCallback(() => {
    refetchUsdc();
    refetchReclaimable();
  }, [refetchUsdc, refetchReclaimable]);

  return {
    totalUsdc,
    totalReclaimable,
    totalUsd,
    usdcByChain,
    reclaimableByProject,
    hasData,
    isLoading,
    isFetching,
    error,
    refetch,
  };
}
