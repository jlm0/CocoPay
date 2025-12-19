import { useQuery } from '@tanstack/react-query';
import { jbControllerAbi, jbTokensAbi, jbTerminalStoreAbi } from 'juice-sdk-core';
import type { Address } from 'viem';
import type { JBProjectState } from '@/types/juicebox';
import { COCOPAY_CHAIN_ID, USDC_DECIMALS, USDC_CURRENCY } from '@/lib/juicebox/constants';
import {
  JB_CONTROLLER_ADDRESS,
  JB_TOKENS_ADDRESS,
  JB_TERMINAL_STORE_ADDRESS,
} from '@/lib/juicebox/contracts';
import { queryKeys } from '@/lib/query';
import { useJBPublicClient } from './useJBPublicClient';

interface UseJBProjectReadResult {
  project: JBProjectState | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useJBProjectRead(projectId: bigint | null): UseJBProjectReadResult {
  const publicClient = useJBPublicClient();

  const query = useQuery({
    queryKey: queryKeys.jb.project(projectId?.toString()),
    queryFn: async (): Promise<JBProjectState> => {
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      const [rulesetData, metadataUri, totalSupply, surplus] = await Promise.all([
        publicClient.readContract({
          address: JB_CONTROLLER_ADDRESS,
          abi: jbControllerAbi,
          functionName: 'currentRulesetOf',
          args: [projectId],
        }),
        publicClient.readContract({
          address: JB_CONTROLLER_ADDRESS,
          abi: jbControllerAbi,
          functionName: 'uriOf',
          args: [projectId],
        }),
        publicClient.readContract({
          address: JB_TOKENS_ADDRESS,
          abi: jbTokensAbi,
          functionName: 'totalSupplyOf',
          args: [projectId],
        }),
        publicClient.readContract({
          address: JB_TERMINAL_STORE_ADDRESS,
          abi: jbTerminalStoreAbi,
          functionName: 'currentTotalSurplusOf',
          args: [projectId, BigInt(USDC_DECIMALS), BigInt(USDC_CURRENCY)],
        }),
      ]);

      const [ruleset, rulesetMetadata] = rulesetData;

      return {
        projectId,
        chainId: COCOPAY_CHAIN_ID,
        owner: '0x0000000000000000000000000000000000000000' as Address,
        metadataUri: metadataUri as string,
        balance: 0n,
        totalSupply,
        surplus,
        ruleset: {
          cycleNumber: BigInt(ruleset.cycleNumber),
          id: BigInt(ruleset.id),
          basedOnId: BigInt(ruleset.basedOnId),
          start: BigInt(ruleset.start),
          duration: BigInt(ruleset.duration),
          weight: ruleset.weight,
          weightCutPercent: BigInt(ruleset.weightCutPercent),
          approvalHook: ruleset.approvalHook,
        },
        rulesetMetadata: {
          reservedPercent: rulesetMetadata.reservedPercent,
          cashOutTaxRate: rulesetMetadata.cashOutTaxRate,
          baseCurrency: rulesetMetadata.baseCurrency,
          pausePay: rulesetMetadata.pausePay,
          pauseCreditTransfers: rulesetMetadata.pauseCreditTransfers,
          allowOwnerMinting: rulesetMetadata.allowOwnerMinting,
          allowTerminalMigration: rulesetMetadata.allowTerminalMigration,
          allowSetTerminals: rulesetMetadata.allowSetTerminals,
          allowSetController: rulesetMetadata.allowSetController,
          allowAddAccountingContext: rulesetMetadata.allowAddAccountingContext,
          allowAddPriceFeed: rulesetMetadata.allowAddPriceFeed,
          ownerMustSendPayouts: rulesetMetadata.ownerMustSendPayouts,
          holdFees: rulesetMetadata.holdFees,
          useTotalSurplusForCashOuts: rulesetMetadata.useTotalSurplusForCashOuts,
          useDataHookForCashOut: rulesetMetadata.useDataHookForCashOut,
          dataHook: rulesetMetadata.dataHook,
        },
      };
    },
    enabled: !!projectId,
    staleTime: 30_000,
  });

  return {
    project: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}
