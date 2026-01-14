import { useState, useCallback, useMemo } from 'react';
import { View, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { Store as StoreIcon, ChevronDown } from 'lucide-react-native';
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
import { queryKeys } from '@/lib/query';
import type { Store } from '@/types';

const INITIAL_VISIBLE_COUNT = 4;
const INCREMENT_COUNT = 4;

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
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

  const { stores, isLoading, error } = useCocoPayStores();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bendystraw.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.cocopayRegistry.all });
    }, [queryClient])
  );

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

  const handleViewMore = () => {
    setVisibleCount((prev) => Math.min(prev + INCREMENT_COUNT, stores.length));
  };

  const visibleStores = stores.slice(0, visibleCount);
  const hasMore = stores.length > visibleCount;

  const rows = useMemo(() => {
    const result: Store[][] = [];
    for (let i = 0; i < visibleStores.length; i += 2) {
      result.push(visibleStores.slice(i, i + 2));
    }
    return result;
  }, [visibleStores]);

  const showSkeleton = isLoading || isRefreshing;

  const ListHeader = (
    <View>
      <HomeBalances isRefreshing={isRefreshing} />
      <View className="gap-4">
        <SectionHeader title="Stores" className="mb-0" />
        <StoreActionCards onDiscoverPress={handleDiscoverPress} onCreatePress={handleCreatePress} />
        {showSkeleton && <StoresGridSkeleton />}
        {!showSkeleton && error && (
          <View className="items-center justify-center px-4 py-8">
            <Icon as={StoreIcon} className="mb-3 text-muted-foreground" size={32} />
            <Text className="text-center text-destructive">Unable to load stores</Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Please check your connection and try again
            </Text>
          </View>
        )}
        {!showSkeleton && !error && stores.length === 0 && (
          <View className="items-center justify-center px-4 py-6">
            <Icon as={StoreIcon} className="mb-3 text-muted-foreground" size={32} />
            <Text className="text-center font-sans-medium text-foreground">No stores yet</Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              Create a store or pay at one to start earning rewards
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const ListFooter =
    hasMore && !showSkeleton && !error ? (
      <Pressable
        onPress={handleViewMore}
        className="flex-row items-center justify-center gap-1 rounded-xl py-2 active:bg-muted">
        <Text className="font-sans-medium text-sm text-muted-foreground">View more</Text>
        <Icon as={ChevronDown} size={16} className="text-muted-foreground" />
      </Pressable>
    ) : null;

  const displayRows = showSkeleton || error || stores.length === 0 ? [] : rows;

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

  return (
    <ScreenContainer
      bottomActionBar={
        <BottomActionBar showBackButton={false}>
          <PayButton onPress={handlePayPress} />
        </BottomActionBar>
      }>
      <HomeHeader onSettingsPress={handleSettingsPress} className="mb-4" />
      <FlatList
        data={displayRows}
        renderItem={renderRow}
        keyExtractor={(row) => row.map((s) => s.id).join('-')}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor="transparent"
            colors={['transparent']}
          />
        }
      />
    </ScreenContainer>
  );
}
