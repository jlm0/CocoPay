import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Store as StoreIcon } from 'lucide-react-native';
import { SectionHeader } from '@/components/presentational/section-header';
import { HomeStoreGrid } from '@/components/presentational/home-store-grid';
import { StoreActionCards } from '@/components/presentational/store-action-cards';
import { useCocoPayStores } from '@/hooks/useCocoPayStores';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon';
import type { Store } from '@/types';

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

type HomeStoresProps = {
  isRefreshing?: boolean;
};

export function HomeStores({ isRefreshing }: HomeStoresProps) {
  const router = useRouter();
  const { stores, isLoading, error } = useCocoPayStores();

  const handleStorePress = (store: Store) => {
    router.push(`/(app)/store/${store.id}`);
  };

  const handleDiscoverPress = () => {
    router.push('/(app)/discover');
  };

  const handleCreatePress = () => {
    router.push('/(app)/create');
  };

  const showSkeleton = isLoading || isRefreshing;

  return (
    <View className="flex-1 gap-4">
      <SectionHeader title="Stores" className="mb-0" />

      <StoreActionCards onDiscoverPress={handleDiscoverPress} onCreatePress={handleCreatePress} />

      {showSkeleton ? (
        <StoresGridSkeleton />
      ) : error ? (
        <View className="items-center justify-center px-4 py-8">
          <Icon as={StoreIcon} className="mb-3 text-muted-foreground" size={32} />
          <Text className="text-center text-destructive">Unable to load stores</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Please check your connection and try again
          </Text>
        </View>
      ) : stores.length === 0 ? (
        <View className="items-center justify-center px-4 py-6">
          <Icon as={StoreIcon} className="mb-3 text-muted-foreground" size={32} />
          <Text className="text-center font-sans-medium text-foreground">No stores yet</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Create a store or pay at one to start earning rewards
          </Text>
        </View>
      ) : (
        <HomeStoreGrid stores={stores} onStorePress={handleStorePress} />
      )}
    </View>
  );
}
