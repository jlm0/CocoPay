import { useMemo, useEffect } from 'react';
import { useBendystrawProject, useBendystrawParticipants } from '@/hooks/bendystraw';
import { useProjectMetadata } from '@/hooks/useProjectMetadata';
import { useJBCashOutQuote } from '@/hooks/juicebox/useJBCashOutQuote';
import { useJBLoanQuote } from '@/hooks/juicebox/useJBLoanQuote';
import { useParaAccount } from '@/hooks/useParaAccount';
import { buildStoreCode } from '@/lib/juicebox/transforms';
import { JB_TOKEN_DECIMALS, USDC_DECIMALS } from '@/lib/juicebox/constants';
import type { StoreDetails } from '@/types';

interface UseStoreDetailsResult {
  store: StoreDetails | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useStoreDetails(projectId: number, chainId: number): UseStoreDetailsResult {
  const { address } = useParaAccount();

  useEffect(() => {
    console.log(`[useStoreDetails] MOUNT projectId=${projectId} chainId=${chainId}`);
  }, [projectId, chainId]);

  const {
    project,
    isLoading: projectLoading,
    error: projectError,
    refetch,
  } = useBendystrawProject(projectId, chainId);

  useEffect(() => {
    console.log(
      `[useStoreDetails] project state: loading=${projectLoading} error=${projectError?.message ?? 'none'} hasProject=${!!project} metadataUri=${project?.metadataUri ?? 'none'}`
    );
  }, [project, projectLoading, projectError]);

  const { metadata, isLoading: metadataLoading } = useProjectMetadata(project?.metadataUri);

  useEffect(() => {
    console.log(
      `[useStoreDetails] metadata state: loading=${metadataLoading} hasMetadata=${!!metadata} hasCocopay=${!!metadata?.cocopay}`
    );
  }, [metadata, metadataLoading]);

  const { participants, isLoading: participantsLoading } = useBendystrawParticipants(
    project
      ? {
          projectId: project.projectId,
          chainId: project.chainId,
          orderBy: 'balance',
          limit: 100,
        }
      : null
  );

  const userBalance = useMemo(() => {
    if (!address || !participants.length) {
      return 0n;
    }
    const lowerAddress = address.toLowerCase();
    const participant = participants.find((p) => p.address.toLowerCase() === lowerAddress);
    return participant ? BigInt(participant.balance) : 0n;
  }, [address, participants]);

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
      name: metadata.name,
      tokenSymbol: `$${metadata.cocopay.ticker}`,
      storeCode: buildStoreCode(BigInt(projectId), chainId),
      balance: balanceNum,
      isOwned,
      valueAtStore,
      cashOutValue,
      borrowValue,
    };
  }, [project, metadata, userBalance, address, cashOutQuote, loanQuote, chainId, projectId]);

  const isLoading =
    projectLoading ||
    metadataLoading ||
    participantsLoading ||
    (userBalance > 0n && (cashOutLoading || loanLoading));

  return {
    store,
    isLoading,
    error: projectError,
    refetch,
  };
}
