import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { StoreListItem } from './store-list-item';
import type { Store } from '@/types';

type StoreListProps = {
  stores: Store[];
  onStorePress?: (store: Store) => void;
  className?: string;
};

const MAX_ANIMATED_ITEMS = 5;
const STAGGER_DELAY_MS = 50;

export function StoreList({ stores, onStorePress, className = '' }: StoreListProps) {
  return (
    <View className={className}>
      {stores.map((store, index) => (
        <Animated.View
          key={store.id}
          entering={
            index < MAX_ANIMATED_ITEMS
              ? FadeInDown.delay(index * STAGGER_DELAY_MS).duration(300)
              : undefined
          }>
          <StoreListItem store={store} onPress={() => onStorePress?.(store)} />
        </Animated.View>
      ))}
    </View>
  );
}
