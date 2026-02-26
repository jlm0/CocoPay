import { useState, useCallback, useMemo, useRef } from 'react';
import { View, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Store as StoreIcon, ChevronUp } from 'lucide-react-native';
import { useFocusRefresh } from '@/hooks/useFocusRefresh';
import { HomeBalances } from '@/components/containers/HomeBalances';
import { HomeHeader } from '@/components/presentational/home-header';
import { HomeStoreCard } from '@/components/presentational/home-store-card';
import { SectionHeader } from '@/components/presentational/section-header';
import { StoreActionCards } from '@/components/presentational/store-action-cards';
import { PayButton } from '@/components/presentational/pay-button';
import { ScreenContainer } from '@/components/presentational/screen-container';
import { BottomActionBar } from '@/components/presentational/bottom-action-bar';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { useCocoPayStores } from '@/hooks/useCocoPayStores';
import { queryKeys, getStoreRegistryQueryKeys } from '@/lib/query';
import type { Store } from '@/types';

const INITIAL_VISIBLE_COUNT = 4;

function StoresGridSkeleton() {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        {[0, 1].map((i) => (
          <View key={i} className="flex-1 rounded-2xl border border-border bg-card p-3">
            <View className="flex-row items-center gap-2.5">
              <Skeleton className="size-10 rounded-full" />
              <View className="flex-1 gap-1.5">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-14 rounded" />
              </View>
            </View>
            <View className="mt-3">
              <Skeleton className="h-7 w-16 rounded" />
            </View>
          </View>
        ))}
      </View>
      <View className="flex-row gap-3">
        {[2, 3].map((i) => (
          <View key={i} className="flex-1 rounded-2xl border border-border bg-card p-3">
            <View className="flex-row items-center gap-2.5">
              <Skeleton className="size-10 rounded-full" />
              <View className="flex-1 gap-1.5">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-5 w-14 rounded" />
              </View>
            </View>
            <View className="mt-3">
              <Skeleton className="h-7 w-16 rounded" />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function HomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const storesListRef = useRef<FlatList<Store[]>>(null);

  const { stores, isLoading, error } = useCocoPayStores();

  useFocusRefresh({
    queryKeys: [queryKeys.bendystraw.all, ...getStoreRegistryQueryKeys()],
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.balance.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.bendystraw.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.projectMetadata.all }),
      queryClient.invalidateQueries({ queryKey: queryKeys.cocopayRegistry.all }),
    ]);
    setIsRefreshing(false);
  }, [queryClient]);

  const handlePayPress = () => {
    router.push('/(app)/pay');
  };

  const handleSettingsPress = () => {
    router.push('/(app)/settings');
  };

  const handleDiscoverPress = () => {
    router.push('/(app)/discover');
  };

  const handleCreatePress = () => {
    router.push('/(app)/create');
  };

  const handleStorePress = (store: Store) => {
    router.push(`/(app)/store/${store.id}`);
  };

  const handleToggleExpand = () => {
    setIsExpanded((prev) => {
      if (prev) {
        storesListRef.current?.scrollToOffset({ offset: 0, animated: false });
      }
      return !prev;
    });
  };

  const visibleStores = isExpanded ? stores : stores.slice(0, INITIAL_VISIBLE_COUNT);
  const hasMore = stores.length > INITIAL_VISIBLE_COUNT;

  const rows = useMemo(() => {
    const result: Store[][] = [];
    for (let i = 0; i < visibleStores.length; i += 2) {
      result.push(visibleStores.slice(i, i + 2));
    }
    return result;
  }, [visibleStores]);

  const showSkeleton = isLoading || isRefreshing;
  const showEmptyState = !showSkeleton && !error && stores.length === 0;
  const showErrorState = !showSkeleton && error;
  const showStores = !showSkeleton && !error && stores.length > 0;

  const renderRow = ({ item: row }: { item: Store[] }) => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      {row.map((store) => (
        <View key={store.id} style={{ flex: 1 }}>
          <HomeStoreCard store={store} onPress={() => handleStorePress(store)} />
        </View>
      ))}
      {row.length === 1 && <View style={{ flex: 1 }} />}
    </View>
  );

  const ListFooter =
    isExpanded && hasMore ? (
      <Pressable
        onPress={handleToggleExpand}
        className="flex-row items-center justify-center gap-1 rounded-xl py-2 active:bg-muted">
        <Text className="font-mono text-sm text-muted-foreground">Show less</Text>
        <Icon as={ChevronUp} size={16} className="text-muted-foreground" />
      </Pressable>
    ) : null;

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar showBackButton={false}>
          <PayButton onPress={handlePayPress} />
        </BottomActionBar>
      }>
      <HomeHeader onSettingsPress={handleSettingsPress} className="mb-4" />

      <View>
        <HomeBalances isRefreshing={isRefreshing} />
        <View className="gap-4">
          <SectionHeader
            title="Stores"
            className="mb-0"
            action={
              hasMore && !showSkeleton && !error
                ? { label: isExpanded ? 'Show less' : 'View more', onPress: handleToggleExpand }
                : undefined
            }
          />
          <StoreActionCards
            onDiscoverPress={handleDiscoverPress}
            onCreatePress={handleCreatePress}
          />
        </View>
      </View>

      {showSkeleton && (
        <View className="mt-4">
          <StoresGridSkeleton />
        </View>
      )}

      {showErrorState && (
        <View className="items-center justify-center px-4 py-8">
          <Icon as={StoreIcon} className="mb-3 text-muted-foreground" size={32} />
          <Text className="text-center text-destructive">Unable to load stores</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Please check your connection and try again
          </Text>
        </View>
      )}

      {showEmptyState && (
        <View className="items-center justify-center px-4 py-6">
          <Icon as={StoreIcon} className="mb-3 text-muted-foreground" size={32} />
          <Text className="text-center font-mono text-foreground">No stores yet</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Create a store or pay at one to start earning rewards
          </Text>
        </View>
      )}

      {showStores && (
        <FlatList
          ref={storesListRef}
          data={rows}
          renderItem={renderRow}
          keyExtractor={(row) => row.map((s) => s.id).join('-')}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ gap: 12, paddingTop: 16, paddingBottom: isExpanded ? 140 : 0 }}
          style={isExpanded ? { flex: 1 } : undefined}
          scrollEnabled={isExpanded}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="transparent"
              colors={['transparent']}
            />
          }
        />
      )}
    </ScreenContainer>
  );
}
