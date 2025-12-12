import { useState, useCallback } from 'react';
import { encodeFunctionData, type Hash } from 'viem';
import { jbControllerAbi } from 'juice-sdk-core';
import type { StoreCreationParams, StoreCreationResult } from '@/types/juicebox';
import { useAlchemySendTransaction } from '@/hooks/useAlchemySendTransaction';
import { useParaAccount } from '@/hooks/useParaAccount';
import { COCOPAY_CHAIN } from '@/lib/juicebox/constants';
import { JB_CONTROLLER_ADDRESS } from '@/lib/juicebox/contracts';
import { buildLaunchProjectConfig, buildStoreCode } from '@/lib/juicebox/transforms';
import { buildProjectMetadata, uploadMetadataToIPFS, getIPFSUri } from '@/lib/juicebox/metadata';
import { useJBPublicClient } from './useJBPublicClient';

interface UseJBProjectCreateResult {
  createProject: (params: StoreCreationParams) => Promise<StoreCreationResult>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useJBProjectCreate(): UseJBProjectCreateResult {
  const { address } = useParaAccount();
  const {
    sendTransaction,
    isLoading: isSending,
    isReady,
  } = useAlchemySendTransaction(COCOPAY_CHAIN);
  const publicClient = useJBPublicClient();

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const createProject = useCallback(
    async (params: StoreCreationParams): Promise<StoreCreationResult> => {
      console.log('[useJBProjectCreate] createProject called with params:', {
        name: params.name,
        ticker: params.ticker,
        cashBackPercent: params.cashBackPercent,
        loyaltyBonusPercent: params.loyaltyBonusPercent,
      });
      console.log('[useJBProjectCreate] wallet address:', address);
      console.log('[useJBProjectCreate] isReady:', isReady);

      if (!address) {
        console.error('[useJBProjectCreate] Error: Wallet not connected');
        throw new Error('Wallet not connected');
      }

      if (!isReady) {
        console.error('[useJBProjectCreate] Error: Transaction client not ready');
        throw new Error('Transaction client not ready');
      }

      setError(null);

      try {
        setIsUploading(true);
        console.log('[useJBProjectCreate] Building project metadata...');
        const metadata = buildProjectMetadata(params);
        console.log('[useJBProjectCreate] Metadata built:', JSON.stringify(metadata, null, 2));

        console.log('[useJBProjectCreate] Uploading metadata to IPFS...');
        const cid = await uploadMetadataToIPFS(metadata);
        console.log('[useJBProjectCreate] IPFS CID:', cid);

        const projectUri = getIPFSUri(cid);
        console.log('[useJBProjectCreate] Project URI:', projectUri);
        setIsUploading(false);

        console.log('[useJBProjectCreate] Building launch config...');
        const launchConfig = buildLaunchProjectConfig(params, projectUri);
        console.log('[useJBProjectCreate] Launch config built:', {
          projectUri: launchConfig.projectUri,
          rulesetCount: launchConfig.rulesetConfigurations.length,
          terminalCount: launchConfig.terminalConfigurations.length,
        });

        const rulesetConfigs = launchConfig.rulesetConfigurations.map((config) => ({
          mustStartAtOrAfter: config.mustStartAtOrAfter,
          duration: config.duration,
          weight: config.weight,
          weightCutPercent: config.weightCutPercent,
          approvalHook: config.approvalHook,
          metadata: {
            reservedPercent: config.metadata.reservedPercent,
            cashOutTaxRate: config.metadata.cashOutTaxRate,
            baseCurrency: config.metadata.baseCurrency,
            pausePay: config.metadata.pausePay,
            pauseCreditTransfers: config.metadata.pauseCreditTransfers,
            allowOwnerMinting: config.metadata.allowOwnerMinting,
            allowSetCustomToken: config.metadata.allowSetCustomToken,
            allowTerminalMigration: config.metadata.allowTerminalMigration,
            allowSetTerminals: config.metadata.allowSetTerminals,
            allowSetController: config.metadata.allowSetController,
            allowAddAccountingContext: config.metadata.allowAddAccountingContext,
            allowAddPriceFeed: config.metadata.allowAddPriceFeed,
            ownerMustSendPayouts: config.metadata.ownerMustSendPayouts,
            holdFees: config.metadata.holdFees,
            useTotalSurplusForCashOuts: config.metadata.useTotalSurplusForCashOuts,
            useDataHookForPay: config.metadata.useDataHookForPay,
            useDataHookForCashOut: config.metadata.useDataHookForCashOut,
            dataHook: config.metadata.dataHook,
            metadata: config.metadata.metadata,
          },
          splitGroups: config.splitGroups.map((group) => ({
            groupId: group.groupId,
            splits: group.splits.map((split) => ({
              percent: split.percent,
              projectId: split.projectId,
              beneficiary: split.beneficiary,
              preferAddToBalance: split.preferAddToBalance,
              lockedUntil: split.lockedUntil,
              hook: split.hook,
            })),
          })),
          fundAccessLimitGroups: config.fundAccessLimitGroups.map((group) => ({
            terminal: group.terminal,
            token: group.token,
            payoutLimits: group.payoutLimits.map((limit) => ({
              amount: limit.amount,
              currency: limit.currency,
            })),
            surplusAllowances: group.surplusAllowances.map((allowance) => ({
              amount: allowance.amount,
              currency: allowance.currency,
            })),
          })),
        }));

        const terminalConfigs = launchConfig.terminalConfigurations.map((config) => ({
          terminal: config.terminal,
          accountingContextsToAccept: config.accountingContextsToAccept.map((ctx) => ({
            token: ctx.token,
            decimals: ctx.decimals,
            currency: ctx.currency,
          })),
        }));

        console.log(
          '[useJBProjectCreate] Ruleset configs:',
          JSON.stringify(rulesetConfigs, null, 2)
        );
        console.log(
          '[useJBProjectCreate] Terminal configs:',
          JSON.stringify(terminalConfigs, null, 2)
        );

        console.log('[useJBProjectCreate] Encoding function data for launchProjectFor...');
        const data = encodeFunctionData({
          abi: jbControllerAbi,
          functionName: 'launchProjectFor',
          args: [
            address,
            launchConfig.projectUri,
            rulesetConfigs,
            terminalConfigs,
            launchConfig.memo,
          ],
        });
        console.log('[useJBProjectCreate] Encoded data length:', data.length);

        console.log(
          '[useJBProjectCreate] Sending transaction to JB_CONTROLLER:',
          JB_CONTROLLER_ADDRESS
        );
        const receipt = await sendTransaction(JB_CONTROLLER_ADDRESS, 0n, data);
        const txHash = receipt.receipt.transactionHash as Hash;
        console.log('[useJBProjectCreate] Transaction hash:', txHash);

        console.log('[useJBProjectCreate] Fetching transaction receipt...');
        const logs = await publicClient.getTransactionReceipt({ hash: txHash });
        console.log('[useJBProjectCreate] Transaction logs count:', logs.logs.length);

        let projectId = 1n;
        for (const log of logs.logs) {
          console.log('[useJBProjectCreate] Log topic[0]:', log.topics[0]);
          if (
            log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
          ) {
            const tokenId = log.topics[3];
            console.log('[useJBProjectCreate] Found Transfer event, tokenId:', tokenId);
            if (tokenId) {
              projectId = BigInt(tokenId);
              console.log('[useJBProjectCreate] Extracted projectId:', projectId.toString());
              break;
            }
          }
        }

        const storeCode = buildStoreCode(projectId);
        console.log('[useJBProjectCreate] Store code:', storeCode);

        const result = {
          projectId,
          storeCode,
          txHash,
        };
        console.log('[useJBProjectCreate] SUCCESS - returning result:', {
          projectId: result.projectId.toString(),
          storeCode: result.storeCode,
          txHash: result.txHash,
        });

        return result;
      } catch (err) {
        console.error('[useJBProjectCreate] ERROR:', err);
        const error = err instanceof Error ? err : new Error('Failed to create project');
        setError(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [address, isReady, sendTransaction, publicClient]
  );

  return {
    createProject,
    isLoading: isUploading || isSending,
    error,
    reset,
  };
}
