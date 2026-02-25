import { useState, useCallback } from 'react';
import type { StoreCreationParams, StoreAddress } from '@/types/juicebox';
import {
  buildProjectMetadata,
  uploadMetadataToIPFS,
  fetchMetadataFromIPFS,
} from '@/lib/juicebox/metadata';
import { getStoredProjectSync, updateStoredProject } from '@/lib/storage/cocopay-projects';
import {
  getStoreFromRegistrySync,
  addStoreToRegistry,
  persistStoreRegistry,
} from '@/lib/storage/store-registry';
import { invalidateAfterStoreCreation } from '@/lib/query/registry-refresh';
import { uploadFileWithRetry } from '@/lib/pinata';
import { buildStoreCode } from '@/lib/juicebox/transforms';

export type StoreUpdateState =
  | { status: 'idle' }
  | { status: 'uploading' }
  | { status: 'success'; metadataCid: string }
  | { status: 'error'; error: Error };

export interface StoreUpdateParams {
  name?: string;
  description?: string;
  logoUri?: string;
  address?: StoreAddress;
  website?: string;
}

interface UseStoreUpdateResult {
  updateStore: (
    projectId: number,
    chainId: number,
    updates: StoreUpdateParams,
    newLogoFile?: { uri: string; type: string; name: string }
  ) => Promise<{ metadataCid: string }>;
  state: StoreUpdateState;
  reset: () => void;
}

export function useStoreUpdate(): UseStoreUpdateResult {
  const [state, setState] = useState<StoreUpdateState>({ status: 'idle' });

  const reset = useCallback(() => {
    setState({ status: 'idle' });
  }, []);

  const updateStore = useCallback(
    async (
      projectId: number,
      chainId: number,
      updates: StoreUpdateParams,
      newLogoFile?: { uri: string; type: string; name: string }
    ): Promise<{ metadataCid: string }> => {
      setState({ status: 'uploading' });

      try {
        const storedProject = getStoredProjectSync(projectId, chainId);
        const existingStore = getStoreFromRegistrySync(projectId, chainId);

        if (!storedProject?.creationParams && !existingStore) {
          throw new Error('Store data not found. Unable to update.');
        }

        let existingParams: StoreCreationParams | null = storedProject?.creationParams ?? null;

        if (!existingParams && storedProject?.metadataCid) {
          const metadata = await fetchMetadataFromIPFS(storedProject.metadataCid);
          if (metadata.cocopay) {
            existingParams = {
              name: metadata.name,
              ticker: metadata.cocopay.ticker,
              description: metadata.description,
              logoUri: metadata.logoUri,
              address: metadata.cocopay.address,
              website: metadata.infoUri,
              cashBackPercent: metadata.cocopay.cashBackPercent,
            };
          }
        }

        if (!existingParams && existingStore) {
          existingParams = {
            name: existingStore.name,
            ticker: existingStore.tokenSymbol.replace(/^\$/, ''),
            description: existingStore.description,
            logoUri: existingStore.logoUri,
            address: existingStore.address,
            cashBackPercent: existingStore.cashBackPercent,
          };
        }

        if (!existingParams) {
          throw new Error('Unable to load existing store parameters.');
        }

        let finalLogoUri = updates.logoUri ?? existingParams.logoUri;

        if (newLogoFile) {
          const uploadResult = await uploadFileWithRetry(
            {
              uri: newLogoFile.uri,
              type: newLogoFile.type,
              name: newLogoFile.name,
            },
            {
              name: `${updates.name ?? existingParams.name}-logo`,
              keyvalues: { app: 'cocopay', type: 'store-logo' },
            }
          );
          finalLogoUri = `ipfs://${uploadResult.cid}`;
        }

        const updatedParams: StoreCreationParams = {
          ...existingParams,
          name: updates.name ?? existingParams.name,
          description: updates.description ?? existingParams.description,
          logoUri: finalLogoUri,
          address: updates.address ?? existingParams.address,
          website: updates.website ?? existingParams.website,
        };

        const metadata = buildProjectMetadata(updatedParams);
        const newMetadataCid = await uploadMetadataToIPFS(metadata);

        await updateStoredProject(projectId, chainId, {
          creationParams: updatedParams,
          metadataCid: newMetadataCid,
        });

        const storeCode = buildStoreCode(BigInt(projectId), chainId);
        addStoreToRegistry({
          id: `${chainId}-${projectId}`,
          projectId,
          chainId,
          suckerGroupId: existingStore?.suckerGroupId ?? '',
          name: updatedParams.name,
          tokenSymbol: `$${updatedParams.ticker}`,
          storeCode,
          description: updatedParams.description,
          logoUri: updatedParams.logoUri,
          address: updatedParams.address,
          cashBackPercent: updatedParams.cashBackPercent,
          issuanceCutPercent: existingStore?.issuanceCutPercent ?? 0.5,
        });

        await persistStoreRegistry();
        invalidateAfterStoreCreation();

        setState({ status: 'success', metadataCid: newMetadataCid });
        return { metadataCid: newMetadataCid };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update store');
        setState({ status: 'error', error });
        throw error;
      }
    },
    []
  );

  return {
    updateStore,
    state,
    reset,
  };
}
