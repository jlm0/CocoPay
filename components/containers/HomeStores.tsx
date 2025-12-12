import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Store as StoreIcon } from 'lucide-react-native';
import { SectionHeader } from '@/components/presentational/section-header';
import { StoreList } from '@/components/presentational/store-list';
import { useCocoPayStores } from '@/hooks/useCocoPayStores';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import type { Store } from '@/types';

export function HomeStores() {
  const router = useRouter();
  const { stores, isLoading, error } = useCocoPayStores();

  const handleAddPress = () => {
    router.push('/(app)/create');
  };

  const handleStorePress = (store: Store) => {
    router.push(`/(app)/store/${store.id}`);
  };

  return (
    <View className="flex-1">
      <SectionHeader title="Stores" showAddButton onAddPress={handleAddPress} className="mb-1" />
      {isLoading ? (
        <View className="items-center justify-center py-8">
          <Spinner size="small" />
        </View>
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
