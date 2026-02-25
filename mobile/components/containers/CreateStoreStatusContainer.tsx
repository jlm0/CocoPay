import { useEffect, useRef, useState, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';
import { useStoreCreation } from '@/lib/contexts/store-creation-context';
import { useOmnichainRevnetCreate } from '@/hooks/juicebox/useOmnichainRevnetCreate';
import { useCocoPayProjectRegistry } from '@/hooks/useCocoPayProjectRegistry';
import { useBendystrawProject } from '@/hooks/bendystraw';
import { refetchAfterStoreCreate } from '@/lib/query';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import { StoreCreationProgress } from '@/components/presentational/store-creation-progress';
import type { OmnichainRevnetCreationResult } from '@/types/revnet';

export type CreationStage =
  | 'preparing'
  | 'simulating'
  | 'deploying'
  | 'confirming'
  | 'finalizing'
  | 'success'
  | 'error';

export function CreateStoreStatusContainer() {
  const router = useRouter();
  const { creationParams, clearCreationParams } = useStoreCreation();
  const {
    createRevnet,
    status: hookStatus,
    error: hookError,
    metadataCid,
    salt,
  } = useOmnichainRevnetCreate();
  const { addProject } = useCocoPayProjectRegistry();

  const [stage, setStage] = useState<CreationStage>('preparing');
  const [result, setResult] = useState<OmnichainRevnetCreationResult | null>(null);
  const [creationError, setCreationError] = useState<Error | null>(null);
  const [storeName, setStoreName] = useState<string>('Your store');
  const hasStarted = useRef(false);

  const finalizingProjectId = stage === 'finalizing' && result ? Number(result.projectId) : null;
  const { project: bendystrawProject, isRetrying: isBendystrawRetrying } = useBendystrawProject(
    finalizingProjectId,
    COCOPAY_CHAIN_ID
  );

  useEffect(() => {
    if (creationParams?.name) {
      setStoreName(creationParams.name);
    }
  }, [creationParams?.name]);

  useEffect(() => {
    if (stage === 'finalizing' && bendystrawProject) {
      console.log('[CreateStoreStatus] Bendystraw project found, moving to success');
      setStage('success');
    }
  }, [stage, bendystrawProject]);

  useEffect(() => {
    if (
      stage === 'finalizing' &&
      !isBendystrawRetrying &&
      !bendystrawProject &&
      finalizingProjectId
    ) {
      console.log('[CreateStoreStatus] Bendystraw polling timed out');
      setCreationError(
        new Error('Store is taking longer than expected to index. You can view it from home.')
      );
      setStage('success');
    }
  }, [stage, isBendystrawRetrying, bendystrawProject, finalizingProjectId]);

  useEffect(() => {
    console.log('[CreateStoreStatus] Redirect check:', {
      hasParams: !!creationParams,
      hasStarted: hasStarted.current,
      stage,
    });
    if (!creationParams && !hasStarted.current) {
      console.log('[CreateStoreStatus] Redirecting to create - no params and not started');
      router.replace('/(app)/create');
    }
  }, [creationParams, router, stage]);

  useEffect(() => {
    const isInProgress = [
      'preparing',
      'simulating',
      'deploying',
      'confirming',
      'finalizing',
    ].includes(stage);
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isInProgress) return true;
      return false;
    });
    return () => subscription.remove();
  }, [stage]);

  const startCreation = useCallback(async () => {
    if (!creationParams) {
      console.log('[CreateStoreStatus] startCreation called but no params');
      return;
    }

    console.log('[CreateStoreStatus] Starting creation for:', creationParams.name);

    try {
      console.log('[CreateStoreStatus] Calling createRevnet...');
      const deployResult = await createRevnet(creationParams);
      console.log('[CreateStoreStatus] createRevnet succeeded:', deployResult.projectId.toString());

      setResult(deployResult);
      setStage('confirming');

      console.log('[CreateStoreStatus] Adding project to registry...');
      await addProject({
        primaryChainId: COCOPAY_CHAIN_ID,
        primaryProjectId: Number(deployResult.projectId),
        failedChains: deployResult.failedChains.length > 0 ? deployResult.failedChains : undefined,
        creationParams,
        metadataCid: metadataCid ?? undefined,
        creationSalt: salt ?? undefined,
      });
      console.log('[CreateStoreStatus] Project added to registry');

      refetchAfterStoreCreate();
      console.log('[CreateStoreStatus] Entering finalizing stage...');
      setStage('finalizing');
      clearCreationParams();
    } catch (err) {
      console.error('[CreateStoreStatus] Error during creation:', err);
      setCreationError(err instanceof Error ? err : new Error('Creation failed'));
      setStage('error');
    }
  }, [creationParams, createRevnet, addProject, clearCreationParams, metadataCid, salt]);

  useEffect(() => {
    console.log('[CreateStoreStatus] Start effect:', {
      hasParams: !!creationParams,
      hasStarted: hasStarted.current,
    });
    if (!creationParams || hasStarted.current) return;
    console.log('[CreateStoreStatus] Setting hasStarted=true and calling startCreation');
    hasStarted.current = true;
    startCreation();
  }, [creationParams, startCreation]);

  useEffect(() => {
    if (hookStatus === 'uploading') setStage('preparing');
    else if (hookStatus === 'simulating') setStage('simulating');
    else if (hookStatus === 'deploying') setStage('deploying');
  }, [hookStatus]);

  const handleRetry = useCallback(() => {
    hasStarted.current = false;
    setCreationError(null);
    setResult(null);
    setStage('preparing');
    startCreation();
  }, [startCreation]);

  const handleViewStore = useCallback(() => {
    if (!result) return;
    const storeId = `${COCOPAY_CHAIN_ID}-${result.projectId.toString()}`;
    router.replace(`/(app)/store/${storeId}`);
  }, [result, router]);

  const handleGoHome = useCallback(() => {
    router.replace('/(app)/home');
  }, [router]);

  const storeId = result ? `${COCOPAY_CHAIN_ID}-${result.projectId.toString()}` : undefined;
  const displayError = creationError ?? hookError;

  return (
    <StoreCreationProgress
      stage={stage}
      storeName={storeName}
      storeId={storeId}
      error={displayError ?? undefined}
      isFinalizingRetrying={isBendystrawRetrying}
      onRetry={handleRetry}
      onViewStore={handleViewStore}
      onGoHome={handleGoHome}
    />
  );
}
