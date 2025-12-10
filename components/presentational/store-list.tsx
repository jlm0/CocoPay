import { View } from 'react-native';
import { StoreListItem } from './store-list-item';
import type { Store } from '@/types';

type StoreListProps = {
  stores: Store[];
  onStorePress?: (store: Store) => void;
  className?: string;
};

export function StoreList({ stores, onStorePress, className = '' }: StoreListProps) {
  return (
    <View className={className}>
      {stores.map((store) => (
        <StoreListItem key={store.id} store={store} onPress={() => onStorePress?.(store)} />
      ))}
    </View>
  );
}
