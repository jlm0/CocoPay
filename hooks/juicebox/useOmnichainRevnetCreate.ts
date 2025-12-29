import { useState, useCallback, useRef, useEffect } from 'react';
import { encodeFunctionData, type Hash, type Address } from 'viem';
import { revDeployerAbi } from 'juice-sdk-core';
import type { StoreCreationParams } from '@/types/juicebox';
import type { OmnichainDeployResult, OmnichainRevnetCreationResult } from '@/types/revnet';
import { useParaAccount } from '@/hooks/useParaAccount';
import { useAlchemySmartAccountClient } from '@/hooks/useAlchemySmartAccountClient';
import {
  OMNICHAIN_CHAINS,
  OMNICHAIN_CHAIN_IDS,
  type OmnichainChainId,
} from '@/lib/juicebox/constants';
import { getRevDeployerAddress, getChainName } from '@/lib/juicebox/revnet';
import { buildOmnichainDeployArgs, generateSalt } from '@/lib/juicebox/revnet-transforms';
import { buildProjectMetadata, uploadMetadataToIPFS } from '@/lib/juicebox/metadata';
import { buildStoreCode } from '@/lib/juicebox/transforms';

const TX_CONFIRMATION_TIMEOUT_SECONDS = 120;
const POLL_INTERVAL_MS = 2000;

type DeployStatus = 'idle' | 'uploading' | 'deploying' | 'success' | 'error';

interface UseOmnichainRevnetCreateResult {
  createRevnet: (params: StoreCreationParams) => Promise<OmnichainRevnetCreationResult>;
  status: DeployStatus;
  chainResults: Map<OmnichainChainId, OmnichainDeployResult>;
  error: Error | null;
  reset: () => void;
}

export function useOmnichainRevnetCreate(): UseOmnichainRevnetCreateResult {
  const { address } = useParaAccount();

  const sepoliaClient = useAlchemySmartAccountClient(OMNICHAIN_CHAINS[0]);
  const baseSepoliaClient = useAlchemySmartAccountClient(OMNICHAIN_CHAINS[1]);
  const arbitrumSepoliaClient = useAlchemySmartAccountClient(OMNICHAIN_CHAINS[2]);
  const optimismSepoliaClient = useAlchemySmartAccountClient(OMNICHAIN_CHAINS[3]);

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

  const getClientForChain = useCallback(
    (chainId: OmnichainChainId) => {
      switch (chainId) {
        case 11155111:
          return sepoliaClient;
        case 84532:
          return baseSepoliaClient;
        case 421614:
          return arbitrumSepoliaClient;
        case 11155420:
          return optimismSepoliaClient;
        default:
          return null;
      }
    },
    [sepoliaClient, baseSepoliaClient, arbitrumSepoliaClient, optimismSepoliaClient]
  );

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
      operatorAddress: Address
    ): Promise<OmnichainDeployResult> => {
      const client = getClientForChain(chainId);

      if (!client) {
        const err = new Error(`Smart account client not ready for ${getChainName(chainId)}`);
        return {
          chainId,
          projectId: 0n,
          txHash: '0x' as Hash,
          status: 'error',
          error: err,
        };
      }

      updateChainResult(chainId, { status: 'pending' });

      try {
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
    [getClientForChain, updateChainResult]
  );

  const createRevnet = useCallback(
    async (params: StoreCreationParams): Promise<OmnichainRevnetCreationResult> => {
      if (!address) {
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
            deployToChain(chainId, metadataCid, salt, params, address)
          )
        );

        const successfulResults = results.filter((r) => r.status === 'success');
        const failedResults = results.filter((r) => r.status === 'error');

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
        };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create revnet');
        setError(error);
        setStatus('error');
        throw error;
      }
    },
    [address, deployToChain, updateChainResult]
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
