import { View, Pressable } from 'react-native';
import { MapPin, Percent, Store } from 'lucide-react-native';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiscoverStore } from '@/types';

type DiscoverStoreCardProps = {
  store: DiscoverStore;
  onPress: () => void;
};

export function DiscoverStoreCard({ store, onPress }: DiscoverStoreCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-xl border border-border bg-card p-4 active:bg-muted">
      <View className="flex-row items-start gap-3">
        <Avatar className="size-12" alt={`${store.name} logo`}>
          {store.logoUri && <AvatarImage source={{ uri: store.logoUri }} />}
          <AvatarFallback className="bg-muted">
            {store.logoUri ? (
              <Skeleton className="size-full rounded-full" />
            ) : (
              <Icon as={Store} size={24} className="text-muted-foreground" />
            )}
          </AvatarFallback>
        </Avatar>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <Text className="font-sans-semibold text-lg">{store.name}</Text>
            <Text className="text-muted-foreground">{store.tokenSymbol}</Text>
          </View>
          {store.address?.formatted && (
            <View className="flex-row items-center gap-1">
              <Icon as={MapPin} size={14} className="text-muted-foreground" />
              <Text variant="caption" className="flex-1 text-muted-foreground" numberOfLines={1}>
                {store.address.formatted}
              </Text>
            </View>
          )}
        </View>
      </View>
      {store.cashBackPercent > 0 && (
        <View className="mt-3 flex-row gap-2">
          <Badge variant="secondary" className="flex-row items-center gap-1">
            <Icon as={Percent} size={12} className="text-foreground" />
            <Text variant="caption">{store.cashBackPercent}% cashback</Text>
          </Badge>
        </View>
      )}
    </Pressable>
  );
}
