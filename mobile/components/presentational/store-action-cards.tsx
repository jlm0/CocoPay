import { View, Pressable } from 'react-native';
import { Compass, Plus } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

type StoreActionCardsProps = {
  onDiscoverPress: () => void;
  onCreatePress: () => void;
};

export function StoreActionCards({ onDiscoverPress, onCreatePress }: StoreActionCardsProps) {
  return (
    <View className="flex-row gap-3">
      <Pressable
        onPress={onDiscoverPress}
        className="bg-primary/10 active:bg-primary/20 flex-1 flex-row items-center gap-3 p-4">
        <View className="bg-primary/15 size-10 items-center justify-center">
          <Icon as={Compass} size={20} className="text-primary" />
        </View>
        <View className="flex-1">
          <Text className="font-brutal uppercase text-foreground">Discover</Text>
          <Text className="text-xs text-muted-foreground">Find new stores</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onCreatePress}
        className="bg-destructive/10 active:bg-destructive/20 flex-1 flex-row items-center gap-3 p-4">
        <View className="bg-destructive/15 size-10 items-center justify-center">
          <Icon as={Plus} size={20} className="text-destructive" />
        </View>
        <View className="flex-1">
          <Text className="font-brutal uppercase text-foreground">Create</Text>
          <Text className="text-xs text-muted-foreground">Start your store</Text>
        </View>
      </Pressable>
    </View>
  );
}
