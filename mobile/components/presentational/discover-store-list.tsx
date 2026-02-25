import { FlatList } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { DiscoverStoreCard } from './discover-store-card';
import type { DiscoverStore } from '@/types';

type DiscoverStoreListProps = {
  stores: DiscoverStore[];
  onStorePress: (store: DiscoverStore) => void;
};

export function DiscoverStoreList({ stores, onStorePress }: DiscoverStoreListProps) {
  return (
    <FlatList
      data={stores}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ gap: 12, paddingBottom: 140 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
          <DiscoverStoreCard store={item} onPress={() => onStorePress(item)} />
        </Animated.View>
      )}
    />
  );
}
