import { useMemo } from 'react';
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
  console.log('[useStoreDetails] Called with:', { projectId, chainId });

  const { address } = useParaAccount();
  console.log('[useStoreDetails] User address:', address);

  const {
    project,
    isLoading: projectLoading,
    error: projectError,
    refetch,
  } = useBendystrawProject(projectId, chainId);

  console.log('[useStoreDetails] Bendystraw project:', {
    found: !!project,
    isLoading: projectLoading,
    owner: project?.owner,
    metadataUri: project?.metadataUri,
    tokenSupply: project?.tokenSupply,
  });

  const { metadata, isLoading: metadataLoading } = useProjectMetadata(project?.metadataUri);

  console.log('[useStoreDetails] Metadata:', {
    found: !!metadata,
    isLoading: metadataLoading,
    name: metadata?.name,
    hasCocopay: !!metadata?.cocopay,
    ticker: metadata?.cocopay?.ticker,
  });

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

  console.log('[useStoreDetails] Participants:', {
    count: participants.length,
    isLoading: participantsLoading,
    participants: participants.map((p) => ({ address: p.address, balance: p.balance })),
  });

  const userBalance = useMemo(() => {
    if (!address || !participants.length) {
      console.log('[useStoreDetails] No address or participants, balance = 0');
      return 0n;
    }
    const lowerAddress = address.toLowerCase();
    const participant = participants.find((p) => p.address.toLowerCase() === lowerAddress);
    const balance = participant ? BigInt(participant.balance) : 0n;
    console.log('[useStoreDetails] User balance:', {
      found: !!participant,
      rawBalance: balance.toString(),
    });
    return balance;
  }, [address, participants]);

  const { quote: cashOutQuote, isLoading: cashOutLoading } = useJBCashOutQuote(
    userBalance > 0n
      ? {
          projectId: BigInt(projectId),
          tokenAmount: userBalance,
        }
      : null
  );

  console.log('[useStoreDetails] Cash out quote:', {
    isLoading: cashOutLoading,
    netAmount: cashOutQuote?.netAmount?.toString(),
  });

  const { quote: loanQuote, isLoading: loanLoading } = useJBLoanQuote(
    userBalance > 0n
      ? {
          projectId: BigInt(projectId),
          collateralAmount: userBalance,
        }
      : null
  );

  console.log('[useStoreDetails] Loan quote:', {
    isLoading: loanLoading,
    borrowableAmount: loanQuote?.borrowableAmount?.toString(),
  });

  const store = useMemo((): StoreDetails | null => {
    console.log('[useStoreDetails] Building store details...');

    if (!project || !metadata?.cocopay) {
      console.log('[useStoreDetails] Missing project or cocopay metadata, returning null');
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

    const storeDetails = {
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

    console.log('[useStoreDetails] Built store details:', storeDetails);
    return storeDetails;
  }, [project, metadata, userBalance, address, cashOutQuote, loanQuote, chainId, projectId]);

  const isLoading =
    projectLoading ||
    metadataLoading ||
    participantsLoading ||
    (userBalance > 0n && (cashOutLoading || loanLoading));

  console.log('[useStoreDetails] Final return:', {
    hasStore: !!store,
    isLoading,
    hasError: !!projectError,
  });

  return {
    store,
    isLoading,
    error: projectError,
    refetch,
  };
}
