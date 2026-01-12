import { View, Pressable } from 'react-native';
import { Store as StoreIcon } from 'lucide-react-native';
import { CachedAvatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import type { Store } from '@/types';

type HomeStoreCardProps = {
  store: Store;
  onPress: () => void;
};

function formatBalance(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function HomeStoreCard({ store, onPress }: HomeStoreCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 rounded-2xl border border-border bg-card p-3 active:bg-muted">
      <View className="flex-row items-center gap-2.5">
        <CachedAvatar
          source={store.logoUri}
          className="size-10"
          fallbackClassName="bg-primary/10"
          fallback={<Icon as={StoreIcon} size={18} className="text-primary" />}
          alt={`${store.name} logo`}
        />
        <View className="flex-1 gap-0.5">
          <Text className="font-sans-medium text-sm text-foreground" numberOfLines={1}>
            {store.name}
          </Text>
          <Badge variant="secondary" className="self-start px-1.5 py-0">
            <Text className="font-sans-medium text-xs text-muted-foreground">
              {store.tokenSymbol}
            </Text>
          </Badge>
        </View>
      </View>
      <View className="mt-3 flex-row items-baseline justify-between">
        <Text className="font-sans-bold text-2xl text-foreground">
          {formatBalance(store.balance)}
        </Text>
        {store.isOwned && (
          <Badge variant="outline" className="border-primary/30 bg-primary/5 px-1.5 py-0">
            <Text className="font-sans-semibold text-xs text-primary">Yours</Text>
          </Badge>
        )}
      </View>
    </Pressable>
  );
}
