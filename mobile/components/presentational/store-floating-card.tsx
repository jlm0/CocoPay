import { Pressable, View } from 'react-native';
import { Store, Percent } from 'lucide-react-native';
import { CachedAvatar } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import type { DiscoverStore } from '@/types';

type StoreFloatingCardProps = {
  store: DiscoverStore;
  onPress: () => void;
};

export function StoreFloatingCard({ store, onPress }: StoreFloatingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-32 left-4 right-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <View className="flex-row items-center gap-3">
        <CachedAvatar
          source={store.logoUri}
          className="size-12"
          fallback={<Icon as={Store} size={24} className="text-muted-foreground" />}
          alt={`${store.name} logo`}
        />
        <View className="flex-1 gap-0.5">
          <Text className="font-sans-semibold text-lg">{store.name}</Text>
          <Text variant="caption" className="text-muted-foreground">
            {store.tokenSymbol}
          </Text>
        </View>
        {store.cashBackPercent > 0 && (
          <Badge variant="secondary" className="flex-row items-center gap-1">
            <Icon as={Percent} size={12} className="text-foreground" />
            <Text variant="caption">{store.cashBackPercent}%</Text>
          </Badge>
        )}
      </View>
    </Pressable>
  );
}
