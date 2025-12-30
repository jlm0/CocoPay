import { View } from 'react-native';
import { MapPin, Percent, TrendingDown, Store } from 'lucide-react-native';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import type { DiscoverStore } from '@/types';

type StorePreviewSheetProps = {
  store: DiscoverStore;
  onViewStore: () => void;
};

export function StorePreviewSheet({ store, onViewStore }: StorePreviewSheetProps) {
  return (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <Avatar className="size-14" alt={`${store.name} logo`}>
          {store.logoUri && <AvatarImage source={{ uri: store.logoUri }} />}
          <AvatarFallback className="bg-muted">
            {store.logoUri ? (
              <Skeleton className="size-full rounded-full" />
            ) : (
              <Icon as={Store} size={28} className="text-muted-foreground" />
            )}
          </AvatarFallback>
        </Avatar>
        <View className="flex-1 gap-1">
          <Text className="font-sans-semibold text-xl">{store.name}</Text>
          <Text className="text-muted-foreground">{store.tokenSymbol}</Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        {store.cashBackPercent > 0 && (
          <Badge variant="secondary" className="flex-row items-center gap-1">
            <Icon as={Percent} size={12} className="text-foreground" />
            <Text variant="caption">{store.cashBackPercent}% cashback</Text>
          </Badge>
        )}
        {store.issuanceCutPercent > 0 && (
          <Badge variant="outline" className="flex-row items-center gap-1">
            <Icon as={TrendingDown} size={12} className="text-muted-foreground" />
            <Text variant="caption" className="text-muted-foreground">
              {store.issuanceCutPercent}%/qtr
            </Text>
          </Badge>
        )}
      </View>

      {store.description && (
        <Text variant="body" className="text-muted-foreground" numberOfLines={3}>
          {store.description}
        </Text>
      )}

      {store.address?.formatted && (
        <View className="flex-row items-center gap-2">
          <Icon as={MapPin} size={16} className="text-muted-foreground" />
          <Text variant="body" className="flex-1 text-muted-foreground" numberOfLines={2}>
            {store.address.formatted}
          </Text>
        </View>
      )}

      <Button onPress={onViewStore} size="lg" className="mt-2">
        <Text className="font-sans-semibold">View Store</Text>
      </Button>
    </View>
  );
}
