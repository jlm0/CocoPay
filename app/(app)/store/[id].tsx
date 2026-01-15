import { useCallback } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FeatureHeader } from '@/components/presentational/feature-header';
import { StoreBalance } from '@/components/presentational/store-balance';
import { StoreValueRow } from '@/components/presentational/store-value-row';
import { StoreRewardBadges } from '@/components/presentational/store-reward-badges';
import { StoreAboutSection } from '@/components/presentational/store-about-section';
import { StoreActions } from '@/components/presentational/store-actions';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { useStoreDetails } from '@/hooks/useStoreDetails';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { parseStoreCode } from '@/lib/juicebox/transforms';
import { COCOPAY_CHAIN_ID } from '@/lib/juicebox/constants';
import { getStoreRegistryQueryKeys } from '@/lib/query';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';

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

  useFocusRefresh({
    queryKeys: getStoreRegistryQueryKeys(),
  });

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
        <View className="flex-1 items-center justify-center gap-4">
          <Spinner size="large" />
          <Text className="text-muted-foreground">Looking for store...</Text>
          <Text className="px-8 text-center text-sm text-muted-foreground">
            Your store is being set up. This usually takes a few seconds.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  if (error || !store) {
    return (
      <ScreenContainer>
        <FeatureHeader title="Store" />
        <View className="flex-1 items-center justify-center gap-4">
          <Text className="text-destructive">Store not found</Text>
          <Text className="px-8 text-center text-sm text-muted-foreground">
            This store may still be processing. Please try again in a moment.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="rounded-full bg-primary px-6 py-2 active:opacity-80">
            <Text className="font-sans-semibold text-primary-foreground">Try again</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} className="mt-2 active:opacity-80">
            <Text className="text-sm text-muted-foreground">Go back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
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
    </ScreenContainer>
  );
}
