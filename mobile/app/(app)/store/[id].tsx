import { useCallback, useState, useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { CircleCheck, CloudUpload } from 'lucide-react-native';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StoreBalance } from '@/components/presentational/store-balance';
import { StoreValueRow } from '@/components/presentational/store-value-row';
import { StoreRewardBadges } from '@/components/presentational/store-reward-badges';
import { StoreAboutSection } from '@/components/presentational/store-about-section';
import { StoreActions } from '@/components/presentational/store-actions';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { LoadingRetryState } from '@/components/presentational/loading-retry-state';
import { ErrorRetryState } from '@/components/presentational/error-retry-state';
import { StoreOptionsMenu } from '@/components/presentational/store-options-menu';
import { ChainReattemptDialog } from '@/components/presentational/chain-reattempt-dialog';
import { useStoreDetails } from '@/hooks/useStoreDetails';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { useChainReattempt } from '@/hooks/useChainReattempt';
import { parseStoreCode } from '@/lib/juicebox/transforms';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import { getStoreRegistryQueryKeys } from '@/lib/query';
import { getStoredProjectSync } from '@/lib/storage/cocopay-projects';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

export default function StoreDetailPage() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const router = useRouter();

  const parsedId = (() => {
    if (!id) return { chainId: COCOPAY_CHAIN_ID, projectId: 0 };
    if (id.includes('-')) {
      return {
        chainId: parseInt(id.split('-')[0], 10),
        projectId: parseInt(id.split('-')[1], 10),
      };
    }
    if (id.includes(':')) {
      const parsed = parseStoreCode(id);
      if (parsed) {
        return { chainId: parsed.chainId, projectId: Number(parsed.projectId) };
      }
    }
    return { chainId: COCOPAY_CHAIN_ID, projectId: parseInt(id, 10) };
  })();

  const { store, isLoading, isRetrying, error, refetch } = useStoreDetails(
    parsedId.projectId,
    parsedId.chainId
  );

  const { reattemptChains, state: reattemptState, reset: resetReattempt } = useChainReattempt();

  const [showReattemptDialog, setShowReattemptDialog] = useState(false);

  useFocusRefresh({
    queryKeys: getStoreRegistryQueryKeys(),
  });

  const storedProject = useMemo(
    () => getStoredProjectSync(parsedId.projectId, parsedId.chainId),
    [parsedId.projectId, parsedId.chainId]
  );

  const failedChainCount = storedProject?.failedChains?.length ?? 0;

  const handleCashOutPress = () => {
    router.push({
      pathname: '/(app)/borrow',
      params: {
        projectId: parsedId.projectId.toString(),
        chainId: parsedId.chainId.toString(),
        storeName: store?.name,
        tokenSymbol: store?.tokenSymbol,
        balance: store?.balance.toString(),
      },
    });
  };

  const handleSpendPress = () => {
    router.push(`/(app)/pay?store=${store?.storeCode}&source=navigation`);
  };

  const handleChargePress = () => {
    router.push({
      pathname: '/(app)/charge',
      params: {
        store: store?.storeCode,
        storeName: store?.name,
        source: 'store',
      },
    });
  };

  const handleAddressPress = useCallback(() => {
    if (!store?.address?.coordinates) return;

    if (source === 'discover-map') {
      router.back();
    } else {
      router.push(`/(app)/discover?viewMode=map&storeId=${store.id}`);
    }
  }, [source, store, router]);

  const handleEditPress = useCallback(() => {
    router.push(`/(app)/store/${id}/edit`);
  }, [id, router]);

  const handleReattemptPress = useCallback(() => {
    setShowReattemptDialog(true);
  }, []);

  const handleReattemptCancel = useCallback(() => {
    setShowReattemptDialog(false);
  }, []);

  const handleReattemptConfirm = useCallback(async () => {
    setShowReattemptDialog(false);

    if (
      !storedProject?.creationParams ||
      !storedProject?.metadataCid ||
      !storedProject?.creationSalt
    ) {
      return;
    }

    if (!storedProject.failedChains || storedProject.failedChains.length === 0) {
      return;
    }

    try {
      await reattemptChains({
        projectId: parsedId.projectId,
        chainId: parsedId.chainId,
        failedChains: storedProject.failedChains,
        metadataCid: storedProject.metadataCid,
        salt: storedProject.creationSalt,
        creationParams: storedProject.creationParams,
      });
    } catch {
      // Error handled in hook state
    }
  }, [storedProject, reattemptChains, parsedId.projectId, parsedId.chainId]);

  const handleReattemptDone = useCallback(() => {
    resetReattempt();
    refetch();
  }, [resetReattempt, refetch]);

  const isReattemptInProgress = reattemptState.status === 'deploying';
  const isReattemptSuccess = reattemptState.status === 'success';
  const isReattemptError = reattemptState.status === 'error';

  const canShowReattempt =
    failedChainCount > 0 &&
    storedProject?.creationParams &&
    storedProject?.metadataCid &&
    storedProject?.creationSalt;

  if (isLoading) {
    return (
      <ScreenContainer
        bottomActionBar={
          <BottomActionBar>
            <StoreActions isOwned={false} disabled />
          </BottomActionBar>
        }>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-6 pb-64">
          <View className="gap-2">
            <View className="flex-row items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </View>
            <Skeleton className="h-4 w-28 rounded" />
          </View>

          <View className="flex-row gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </View>

          <View className="gap-1">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-12 w-48 rounded-lg" />
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 gap-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </View>
            <View className="flex-1 gap-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </View>
            <View className="flex-1 gap-1">
              <Skeleton className="h-3 w-20 rounded" />
              <Skeleton className="h-5 w-16 rounded" />
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  if (isRetrying) {
    return (
      <ScreenContainer>
        <FeatureHeader title="Store" />
        <LoadingRetryState
          title="Looking for store..."
          message="Your store is being set up. This usually takes a few seconds."
        />
      </ScreenContainer>
    );
  }

  if (error || !store) {
    return (
      <ErrorRetryState
        title="Store not found"
        message="This store may still be processing. Please try again in a moment."
        onRetry={refetch}
        onBack={() => router.back()}
        header={<FeatureHeader title="Store" />}
      />
    );
  }

  if (isReattemptInProgress) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={FadeIn.duration(300)} className="items-center">
            <View className="mb-6 h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Icon as={CloudUpload} size={32} className="text-primary" />
            </View>
            <Text variant="heading" className="mb-2 text-center">
              Deploying to chains...
            </Text>
            <Text variant="caption" className="text-center">
              {reattemptState.completedCount} of {reattemptState.totalCount} complete
            </Text>
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  if (isReattemptSuccess) {
    const { successCount, remainingFailed } = reattemptState;
    return (
      <ScreenContainer
        bottomActionBar={
          <BottomActionBar showBackButton={false}>
            <Button onPress={handleReattemptDone} size="lg" className="h-14 rounded-xl">
              <Text>Continue</Text>
            </Button>
          </BottomActionBar>
        }>
        <View className="flex-1 items-center justify-center px-6">
          <Animated.View entering={ZoomIn.springify().damping(12)} className="mb-6">
            <Icon as={CircleCheck} size={80} className="text-primary" />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mb-2">
            <Text variant="title" className="text-center">
              {remainingFailed.length === 0 ? 'All Chains Deployed' : 'Partial Success'}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).duration(400)}>
            <Text variant="caption" className="text-center">
              {successCount} chain{successCount !== 1 ? 's' : ''} deployed successfully
              {remainingFailed.length > 0 && `. ${remainingFailed.length} still pending.`}
            </Text>
          </Animated.View>
        </View>
      </ScreenContainer>
    );
  }

  if (isReattemptError) {
    const { error: reattemptError } = reattemptState;
    return (
      <ErrorRetryState
        title="Deployment failed"
        message={reattemptError.message}
        onRetry={handleReattemptConfirm}
        onBack={handleReattemptDone}
        header={<FeatureHeader title="Retry Deployment" />}
      />
    );
  }

  const valueItems = [
    { label: store.isOwned ? 'Spend value' : 'Value at store', value: store.valueAtStore },
    { label: 'Cash out value', value: store.cashOutValue },
  ];

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar>
          <StoreActions
            isOwned={store.isOwned}
            onCashOutPress={handleCashOutPress}
            onSpendPress={handleSpendPress}
            onChargePress={handleChargePress}
          />
        </BottomActionBar>
      }>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="gap-6 pb-64">
        <FeatureHeader
          title={store.name}
          subtitle={`#${parsedId.projectId}`}
          badge={store.isOwned ? 'Yours' : undefined}
          logoUri={store.logoUri ?? undefined}
          rightAction={
            store.isOwned ? (
              <StoreOptionsMenu
                onEditPress={handleEditPress}
                onReattemptPress={canShowReattempt ? handleReattemptPress : undefined}
                failedChainCount={failedChainCount}
              />
            ) : undefined
          }
        />

        <StoreRewardBadges cashBackPercent={store.cashBackPercent} />

        <StoreBalance balance={store.balance} tokenSymbol={store.tokenSymbol} />

        <StoreValueRow values={valueItems} />

        <StoreAboutSection
          description={store.description}
          address={store.address}
          website={store.website}
          onAddressPress={store.address?.coordinates ? handleAddressPress : undefined}
        />
      </ScrollView>

      <ChainReattemptDialog
        open={showReattemptDialog}
        onOpenChange={setShowReattemptDialog}
        failedChainCount={failedChainCount}
        onConfirm={handleReattemptConfirm}
        onCancel={handleReattemptCancel}
      />
    </ScreenContainer>
  );
}
