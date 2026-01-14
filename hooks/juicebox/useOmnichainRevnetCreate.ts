import { useState, useCallback, useRef, useEffect } from 'react';
import { encodeFunctionData, type Hash, type Address, type LocalAccount } from 'viem';
import { revDeployerAbi } from 'juice-sdk-core';
import { alchemy } from '@account-kit/infra';
import { createModularAccountV2Client } from '@account-kit/smart-contracts';
import { LocalAccountSigner } from '@aa-sdk/core';
import type { StoreCreationParams } from '@/types/juicebox';
import type { OmnichainDeployResult, OmnichainRevnetCreationResult } from '@/types/revnet';
import { useParaAccount } from '@/hooks/useParaAccount';
import { ALCHEMY_API_KEY, GAS_POLICY_ID } from '@/lib/alchemy';
import { ALCHEMY_AA_CHAINS, type SupportedChainId } from '@/lib/network';
import {
  OMNICHAIN_CHAINS,
  OMNICHAIN_CHAIN_IDS,
  type OmnichainChainId,
} from '@/lib/juicebox/constants';
import { getRevDeployerAddress } from '@/lib/juicebox/revnet';
import { buildOmnichainDeployArgs, generateSalt } from '@/lib/juicebox/revnet-transforms';
import { buildProjectMetadata, uploadMetadataToIPFS } from '@/lib/juicebox/metadata';
import { buildStoreCode } from '@/lib/juicebox/transforms';

const TX_CONFIRMATION_TIMEOUT_SECONDS = 120;
const POLL_INTERVAL_MS = 2000;
const MAX_DEPLOY_RETRIES = 2;

type DeployStatus = 'idle' | 'uploading' | 'simulating' | 'deploying' | 'success' | 'error';

interface UseOmnichainRevnetCreateResult {
  createRevnet: (params: StoreCreationParams) => Promise<OmnichainRevnetCreationResult>;
  status: DeployStatus;
  chainResults: Map<OmnichainChainId, OmnichainDeployResult>;
  error: Error | null;
  reset: () => void;
}

async function createClientForChain(account: LocalAccount, chainId: OmnichainChainId) {
  const chain = OMNICHAIN_CHAINS.find((c) => c.id === chainId);
  if (!chain) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }

  const signer = new LocalAccountSigner(account);
  const transport = alchemy({ apiKey: ALCHEMY_API_KEY });
  const alchemyChain = ALCHEMY_AA_CHAINS[chainId as SupportedChainId] ?? chain;

  return createModularAccountV2Client({
    transport,
    chain: alchemyChain,
    signer,
    policyId: GAS_POLICY_ID,
    mode: '7702',
  });
}

export function useOmnichainRevnetCreate(): UseOmnichainRevnetCreateResult {
  const { address, account } = useParaAccount();

  const [status, setStatus] = useState<DeployStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  const [chainResults, setChainResults] = useState<Map<OmnichainChainId, OmnichainDeployResult>>(
    new Map()
  );

  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setChainResults(new Map());
    abortRef.current = false;
  }, []);

  const updateChainResult = useCallback(
    (chainId: OmnichainChainId, result: Partial<OmnichainDeployResult>) => {
      setChainResults((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(chainId) ?? {
          chainId,
          projectId: 0n,
          txHash: '0x' as Hash,
          status: 'pending' as const,
        };
        updated.set(chainId, { ...existing, ...result });
        return updated;
      });
    },
    []
  );

  const deployToChain = useCallback(
    async (
      chainId: OmnichainChainId,
      metadataCid: string,
      salt: `0x${string}`,
      params: StoreCreationParams,
      operatorAddress: Address,
      userAccount: LocalAccount
    ): Promise<OmnichainDeployResult> => {
      updateChainResult(chainId, { status: 'pending' });

      try {
        const client = await createClientForChain(userAccount, chainId);

        const deployArgs = buildOmnichainDeployArgs(
          params,
          metadataCid,
          chainId,
          salt,
          operatorAddress
        );

        const data = encodeFunctionData({
          abi: revDeployerAbi,
          functionName: 'deployFor',
          args: [
            deployArgs.revnetId,
            deployArgs.configuration,
            deployArgs.terminalConfigurations,
            deployArgs.buybackHookConfiguration,
            deployArgs.suckerDeploymentConfiguration,
          ],
        });

        const revDeployerAddress = getRevDeployerAddress(chainId);

        const { hash: userOpHash } = await client.sendUserOperation({
          uo: { target: revDeployerAddress, value: 0n, data },
        });

        let userOpReceipt = await client.getUserOperationReceipt(userOpHash);
        let retries = 0;

        while (!userOpReceipt && retries < TX_CONFIRMATION_TIMEOUT_SECONDS) {
          if (abortRef.current) {
            throw new Error('Deployment aborted');
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
          userOpReceipt = await client.getUserOperationReceipt(userOpHash);
          retries++;
        }

        if (!userOpReceipt) {
          throw new Error(
            `Transaction confirmation timed out after ${TX_CONFIRMATION_TIMEOUT_SECONDS} seconds`
          );
        }

        const txHash = userOpReceipt.receipt.transactionHash as Hash;

        let projectId = 0n;
        for (const log of userOpReceipt.receipt.logs) {
          if (
            log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
          ) {
            const tokenId = log.topics[3];
            if (tokenId) {
              projectId = BigInt(tokenId);
              break;
            }
          }
        }

        const result: OmnichainDeployResult = {
          chainId,
          projectId,
          txHash,
          status: 'success',
        };

        updateChainResult(chainId, result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Deployment failed');
        const result: OmnichainDeployResult = {
          chainId,
          projectId: 0n,
          txHash: '0x' as Hash,
          status: 'error',
          error,
        };
        updateChainResult(chainId, result);
        return result;
      }
    },
    [updateChainResult]
  );

  const simulateOnChain = useCallback(
    async (
      chainId: OmnichainChainId,
      metadataCid: string,
      salt: `0x${string}`,
      params: StoreCreationParams,
      operatorAddress: Address,
      userAccount: LocalAccount
    ): Promise<{ chainId: OmnichainChainId; success: boolean; error?: Error }> => {
      try {
        const client = await createClientForChain(userAccount, chainId);

        const deployArgs = buildOmnichainDeployArgs(
          params,
          metadataCid,
          chainId,
          salt,
          operatorAddress
        );

        const data = encodeFunctionData({
          abi: revDeployerAbi,
          functionName: 'deployFor',
          args: [
            deployArgs.revnetId,
            deployArgs.configuration,
            deployArgs.terminalConfigurations,
            deployArgs.buybackHookConfiguration,
            deployArgs.suckerDeploymentConfiguration,
          ],
        });

        const revDeployerAddress = getRevDeployerAddress(chainId);

        await client.checkGasSponsorshipEligibility({
          uo: { target: revDeployerAddress, value: 0n, data },
        });

        return { chainId, success: true };
      } catch (err) {
        return {
          chainId,
          success: false,
          error: err instanceof Error ? err : new Error('Simulation failed'),
        };
      }
    },
    []
  );

  const deployWithRetry = useCallback(
    async (
      chainId: OmnichainChainId,
      metadataCid: string,
      salt: `0x${string}`,
      params: StoreCreationParams,
      operatorAddress: Address,
      userAccount: LocalAccount
    ): Promise<OmnichainDeployResult> => {
      let lastResult: OmnichainDeployResult | null = null;

      for (let attempt = 0; attempt <= MAX_DEPLOY_RETRIES; attempt++) {
        if (abortRef.current) {
          return {
            chainId,
            projectId: 0n,
            txHash: '0x' as Hash,
            status: 'error',
            error: new Error('Deployment aborted'),
          };
        }

        const result = await deployToChain(
          chainId,
          metadataCid,
          salt,
          params,
          operatorAddress,
          userAccount
        );
        lastResult = result;

        if (result.status === 'success') {
          return result;
        }

        if (attempt < MAX_DEPLOY_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }

      return lastResult!;
    },
    [deployToChain]
  );

  const createRevnet = useCallback(
    async (params: StoreCreationParams): Promise<OmnichainRevnetCreationResult> => {
      if (!address || !account) {
        throw new Error('Wallet not connected');
      }

      abortRef.current = false;
      setError(null);
      setChainResults(new Map());
      setStatus('uploading');

      try {
        const metadata = buildProjectMetadata(params);
        const metadataCid = await uploadMetadataToIPFS(metadata);

        const salt = generateSalt();

        setStatus('simulating');

        const simulationResults = await Promise.all(
          OMNICHAIN_CHAIN_IDS.map((chainId) =>
            simulateOnChain(chainId, metadataCid, salt, params, address, account)
          )
        );

        const failedSimulations = simulationResults.filter((r) => !r.success);
        if (failedSimulations.length > 0) {
          const firstError =
            failedSimulations[0]?.error ?? new Error('Simulation failed on one or more chains');
          setError(firstError);
          setStatus('error');
          throw firstError;
        }

        setStatus('deploying');

        for (const chainId of OMNICHAIN_CHAIN_IDS) {
          updateChainResult(chainId, {
            chainId,
            projectId: 0n,
            txHash: '0x' as Hash,
            status: 'pending',
          });
        }

        const results = await Promise.all(
          OMNICHAIN_CHAIN_IDS.map((chainId) =>
            deployWithRetry(chainId, metadataCid, salt, params, address, account)
          )
        );

        const successfulResults = results.filter((r) => r.status === 'success');
        const failedResults = results.filter((r) => r.status === 'error');
        const failedChains = failedResults.map((r) => r.chainId);

        if (successfulResults.length === 0) {
          const firstError = failedResults[0]?.error ?? new Error('All deployments failed');
          setError(firstError);
          setStatus('error');
          throw firstError;
        }

        const projectId = successfulResults[0].projectId;
        const storeCode = buildStoreCode(projectId);

        setStatus('success');

        return {
          projectId,
          results,
          storeCode,
          failedChains,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create revnet');
        setError(error);
        setStatus('error');
        throw error;
      }
    },
    [address, account, deployWithRetry, simulateOnChain, updateChainResult]
  );

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  return {
    createRevnet,
    status,
    chainResults,
    error,
    reset,
  };
}
