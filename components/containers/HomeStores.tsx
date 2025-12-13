import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Store as StoreIcon } from 'lucide-react-native';
import { SectionHeader } from '@/components/presentational/section-header';
import { StoreList } from '@/components/presentational/store-list';
import { useCocoPayStores } from '@/hooks/useCocoPayStores';
import { Text } from '@/components/ui/text';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { Store } from '@/types';

function StoresSkeleton() {
  return (
    <View className="gap-3">
      {[0, 1, 2].map((i) => (
        <View key={i} className="flex-row items-center py-3">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="mx-2 h-4 w-6 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </View>
      ))}
    </View>
  );
}

export function HomeStores() {
  const router = useRouter();
  const { stores, isLoading, isFetching, error } = useCocoPayStores();

  const handleAddPress = () => {
    router.push('/(app)/create');
  };

  const handleStorePress = (store: Store) => {
    router.push(`/(app)/store/${store.id}`);
  };

  const showSkeleton = isLoading && !isFetching;

  return (
    <View className="flex-1">
      <SectionHeader title="Stores" showAddButton onAddPress={handleAddPress} className="mb-1" />
      {showSkeleton ? (
        <StoresSkeleton />
      ) : error ? (
        <View className="items-center justify-center px-4 py-8">
          <Icon as={StoreIcon} className="mb-3 text-muted-foreground" size={32} />
          <Text className="text-center text-destructive">Unable to load stores</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Please check your connection and try again
          </Text>
        </View>
      ) : stores.length === 0 ? (
        <View className="items-center justify-center px-4 py-8">
          <Icon as={StoreIcon} className="mb-3 text-muted-foreground" size={32} />
          <Text className="text-center font-sans-medium text-foreground">No stores yet</Text>
          <Text className="mb-4 mt-1 text-center text-sm text-muted-foreground">
            Create your first store to start accepting payments
          </Text>
          <Button variant="outline" size="sm" onPress={handleAddPress}>
            <Text>Create Store</Text>
          </Button>
        </View>
      ) : (
        <StoreList stores={stores} onStorePress={handleStorePress} />
      )}
    </View>
  );
}
