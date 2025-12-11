import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import type { Store } from '@/types';

type StoreListItemProps = {
  store: Store;
  onPress?: () => void;
};

export function StoreListItem({ store, onPress }: StoreListItemProps) {
  const formatBalance = (value: number) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Pressable onPress={onPress} disabled={!onPress} className="py-3 active:opacity-70">
      <View className="flex-row items-baseline">
        <Text variant="body-emphasis">{formatBalance(store.balance)}</Text>
        <Text variant="caption" className="mx-1">
          of
        </Text>
        <Text
          className="font-sans-bold text-sm text-primary"
          style={{ textDecorationLine: 'underline', textDecorationStyle: 'dashed' }}>
          {store.tokenSymbol}
        </Text>
        {store.isOwned && (
          <View className="ml-2 rounded bg-primary/10 px-1.5 py-0.5">
            <Text className="font-sans-semibold text-xs text-primary">Yours</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
