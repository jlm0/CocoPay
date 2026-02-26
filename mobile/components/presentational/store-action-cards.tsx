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
        className="flex-1 flex-row items-center gap-3 rounded-2xl bg-primary/10 p-4 active:bg-primary/20">
        <View className="size-10 items-center justify-center rounded-full bg-primary/15">
          <Icon as={Compass} size={20} className="text-primary" />
        </View>
        <View className="flex-1">
          <Text className="font-brutal text-foreground">Discover</Text>
          <Text className="text-xs text-muted-foreground">Find new stores</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onCreatePress}
        className="flex-1 flex-row items-center gap-3 rounded-2xl bg-accent-warm/10 p-4 active:bg-accent-warm/20">
        <View className="size-10 items-center justify-center rounded-full bg-accent-warm/15">
          <Icon as={Plus} size={20} className="text-accent-warm" />
        </View>
        <View className="flex-1">
          <Text className="font-brutal text-foreground">Create</Text>
          <Text className="text-xs text-muted-foreground">Start your store</Text>
        </View>
      </Pressable>
    </View>
  );
}
