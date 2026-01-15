import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBendystrawProject } from '@/hooks/bendystraw';
import { fetchParticipant } from '@/lib/bendystraw';
import { useProjectMetadata } from '@/hooks/useProjectMetadata';
import { useJBCashOutQuote } from '@/hooks/juicebox/useJBCashOutQuote';
import { useJBLoanQuote } from '@/hooks/juicebox/useJBLoanQuote';
import { useParaAccount } from '@/hooks/useParaAccount';
import { buildStoreCode } from '@/lib/juicebox/transforms';
import { JB_TOKEN_DECIMALS, USDC_DECIMALS } from '@/lib/juicebox/constants';
import { resolveIpfsUri } from '@/lib/pinata';
import { queryKeys } from '@/lib/query';
import { getStoreFromRegistrySync, type RegistryStore } from '@/lib/storage';
import type { StoreDetails } from '@/types';

interface UseStoreDetailsResult {
  store: StoreDetails | null;
  baseStore: RegistryStore | null;
  isLoading: boolean;
  isLoadingUserData: boolean;
  isRetrying: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useStoreDetails(projectId: number, chainId: number): UseStoreDetailsResult {
  const { address } = useParaAccount();

  const baseStore = useMemo(
    () => (projectId > 0 ? getStoreFromRegistrySync(projectId, chainId) : null),
    [projectId, chainId]
  );

  const {
    project,
    isLoading: projectLoading,
    isRetrying,
    error: projectError,
    refetch,
  } = useBendystrawProject(projectId, chainId);

  const { metadata, isLoading: metadataLoading } = useProjectMetadata(project?.metadataUri);

  const { data: userParticipant, isLoading: participantLoading } = useQuery({
    queryKey: queryKeys.bendystraw.participant(projectId, chainId, address ?? null),
    queryFn: () =>
      fetchParticipant({
        projectId,
        chainId,
        address: address!,
      }),
    enabled: !!project && !!address,
    staleTime: 30_000,
  });

  const userBalance = useMemo(() => {
    if (!userParticipant) {
      return 0n;
    }
    return BigInt(userParticipant.balance);
  }, [userParticipant]);

  const { quote: cashOutQuote, isLoading: cashOutLoading } = useJBCashOutQuote(
    userBalance > 0n
      ? {
          projectId: BigInt(projectId),
          tokenAmount: userBalance,
        }
      : null
  );

  const { quote: loanQuote, isLoading: loanLoading } = useJBLoanQuote(
    userBalance > 0n
      ? {
          projectId: BigInt(projectId),
          collateralAmount: userBalance,
        }
      : null
  );

  const store = useMemo((): StoreDetails | null => {
    if (!project || !metadata?.cocopay) {
      return null;
    }

    const balanceNum = Number(userBalance) / 10 ** JB_TOKEN_DECIMALS;
    const isOwned = address ? project.owner.toLowerCase() === address.toLowerCase() : false;

    const valueAtStore = balanceNum;

    const cashOutValue = cashOutQuote?.netAmount
      ? Number(cashOutQuote.netAmount) / 10 ** USDC_DECIMALS
      : 0;

    const borrowValue = loanQuote?.borrowableAmount
      ? Number(loanQuote.borrowableAmount) / 10 ** USDC_DECIMALS
      : 0;

    return {
      id: `${chainId}-${projectId}`,
      suckerGroupId: project.suckerGroupId,
      name: metadata.name,
      tokenSymbol: `$${metadata.cocopay.ticker}`,
      storeCode: buildStoreCode(BigInt(projectId), chainId),
      balance: balanceNum,
      isOwned,
      valueAtStore,
      cashOutValue,
      borrowValue,
      description: metadata.description,
      logoUri: resolveIpfsUri(metadata.logoUri),
      address: metadata.cocopay.address,
      website: metadata.infoUri,
      cashBackPercent: metadata.cocopay.cashBackPercent,
      issuanceCutPercent: metadata.cocopay.issuanceCutPercent,
    };
  }, [project, metadata, userBalance, address, cashOutQuote, loanQuote, chainId, projectId]);

  const isLoadingUserData =
    participantLoading || (userBalance > 0n && (cashOutLoading || loanLoading));

  const isLoading = !baseStore && (projectLoading || metadataLoading) && !store;

  return {
    store,
    baseStore,
    isLoading,
    isLoadingUserData,
    isRetrying,
    error: projectError,
    refetch,
  };
}
