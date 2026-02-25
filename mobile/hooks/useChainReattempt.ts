import { useState, useCallback, useRef, useEffect } from 'react';
import { encodeFunctionData, type Hash, type Address, type LocalAccount } from 'viem';
import { revDeployerAbi } from 'juice-sdk-core';
import { alchemy } from '@account-kit/infra';
import { createModularAccountV2Client } from '@account-kit/smart-contracts';
import { LocalAccountSigner } from '@aa-sdk/core';
import type { StoreCreationParams } from '@/types/juicebox';
import type { OmnichainDeployResult } from '@/types/revnet';
import { useParaAccount } from '@/hooks/useParaAccount';
import { ALCHEMY_API_KEY, GAS_POLICY_ID } from '@/lib/alchemy';
import { ALCHEMY_AA_CHAINS, type SupportedChainId } from '@/lib/network';
import { OMNICHAIN_CHAINS, type OmnichainChainId } from '@/lib/juicebox/constants';
import { getRevDeployerAddress } from '@/lib/juicebox/revnet';
import { buildOmnichainDeployArgs } from '@/lib/juicebox/revnet-transforms';
import { updateStoredProject } from '@/lib/storage/cocopay-projects';
import { invalidateAfterStoreCreation } from '@/lib/query/registry-refresh';

const TX_CONFIRMATION_TIMEOUT_SECONDS = 120;
const POLL_INTERVAL_MS = 2000;
const MAX_DEPLOY_RETRIES = 2;

export type ChainReattemptState =
  | { status: 'idle' }
  | { status: 'deploying'; completedCount: number; totalCount: number }
  | { status: 'success'; successCount: number; remainingFailed: number[] }
  | { status: 'error'; error: Error; partialSuccess: number[] };

interface UseChainReattemptResult {
  reattemptChains: (params: ChainReattemptParams) => Promise<ChainReattemptResult>;
  state: ChainReattemptState;
  chainResults: Map<OmnichainChainId, OmnichainDeployResult>;
  reset: () => void;
}

interface ChainReattemptParams {
  projectId: number;
  chainId: number;
  failedChains: number[];
  metadataCid: string;
  salt: `0x${string}`;
  creationParams: StoreCreationParams;
}

interface ChainReattemptResult {
  successCount: number;
  remainingFailed: number[];
  results: OmnichainDeployResult[];
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

export function useChainReattempt(): UseChainReattemptResult {
  const { address, account } = useParaAccount();

  const [state, setState] = useState<ChainReattemptState>({ status: 'idle' });
  const [chainResults, setChainResults] = useState<Map<OmnichainChainId, OmnichainDeployResult>>(
    new Map()
  );

  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setState({ status: 'idle' });
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

  const reattemptChains = useCallback(
    async (params: ChainReattemptParams): Promise<ChainReattemptResult> => {
      if (!address || !account) {
        throw new Error('Wallet not connected');
      }

      abortRef.current = false;
      setChainResults(new Map());
      setState({
        status: 'deploying',
        completedCount: 0,
        totalCount: params.failedChains.length,
      });

      try {
        const results: OmnichainDeployResult[] = [];
        let completedCount = 0;

        for (const targetChainId of params.failedChains) {
          if (abortRef.current) break;

          const result = await deployWithRetry(
            targetChainId as OmnichainChainId,
            params.metadataCid,
            params.salt,
            params.creationParams,
            address,
            account
          );

          results.push(result);
          completedCount++;

          setState({
            status: 'deploying',
            completedCount,
            totalCount: params.failedChains.length,
          });
        }

        const successfulChains = results
          .filter((r) => r.status === 'success')
          .map((r) => r.chainId);
        const remainingFailed = params.failedChains.filter((c) => !successfulChains.includes(c));

        await updateStoredProject(params.projectId, params.chainId, {
          failedChains: remainingFailed.length > 0 ? remainingFailed : undefined,
        });

        invalidateAfterStoreCreation();

        if (remainingFailed.length === params.failedChains.length) {
          const error = new Error('All chain deployments failed');
          setState({
            status: 'error',
            error,
            partialSuccess: [],
          });
          throw error;
        }

        setState({
          status: 'success',
          successCount: successfulChains.length,
          remainingFailed,
        });

        return {
          successCount: successfulChains.length,
          remainingFailed,
          results,
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to reattempt chains');
        const partialSuccess = Array.from(chainResults.values())
          .filter((r) => r.status === 'success')
          .map((r) => r.chainId);

        setState({
          status: 'error',
          error,
          partialSuccess,
        });
        throw error;
      }
    },
    [address, account, deployWithRetry, chainResults]
  );

  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  return {
    reattemptChains,
    state,
    chainResults,
    reset,
  };
}
