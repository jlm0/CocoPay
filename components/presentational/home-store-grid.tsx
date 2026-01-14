import { useState } from 'react';
import { View, Pressable, FlatList } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { HomeStoreCard } from './home-store-card';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import type { Store } from '@/types';

type HomeStoreGridProps = {
  stores: Store[];
  onStorePress: (store: Store) => void;
  initialCount?: number;
  incrementCount?: number;
  maxHeight?: number;
};

export function HomeStoreGrid({
  stores,
  onStorePress,
  initialCount = 4,
  incrementCount = 4,
  maxHeight = 400,
}: HomeStoreGridProps) {
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const hasMore = stores.length > visibleCount;
  const visibleStores = stores.slice(0, visibleCount);

  const handleViewMore = () => {
    setVisibleCount((prev) => Math.min(prev + incrementCount, stores.length));
  };

  const rows: Store[][] = [];
  for (let i = 0; i < visibleStores.length; i += 2) {
    rows.push(visibleStores.slice(i, i + 2));
  }

  const renderRow = ({ item: row }: { item: Store[] }) => (
    <View className="flex-row gap-3">
      {row.map((store) => (
        <View key={store.id} className="flex-1">
          <HomeStoreCard store={store} onPress={() => onStorePress(store)} />
        </View>
      ))}
      {row.length === 1 && <View className="flex-1" />}
    </View>
  );

  const ListFooter = hasMore ? (
    <Pressable
      onPress={handleViewMore}
      className="flex-row items-center justify-center gap-1 rounded-xl py-2 active:bg-muted">
      <Text className="font-sans-medium text-sm text-muted-foreground">View more</Text>
      <Icon as={ChevronDown} size={16} className="text-muted-foreground" />
    </Pressable>
  ) : null;

  return (
    <FlatList
      data={rows}
      renderItem={renderRow}
      keyExtractor={(_, index) => `row-${index}`}
      style={{ maxHeight }}
      nestedScrollEnabled
      scrollEnabled={rows.length > 2}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 12 }}
      ListFooterComponent={ListFooter}
    />
  );
}
