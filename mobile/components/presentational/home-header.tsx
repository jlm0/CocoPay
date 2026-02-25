import { View, Pressable } from 'react-native';
import { Settings } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

type HomeHeaderProps = {
  onSettingsPress: () => void;
  className?: string;
};

export function HomeHeader({ onSettingsPress, className }: HomeHeaderProps) {
  return (
    <View className={cn('flex-row items-center justify-between', className)}>
      <Text className="text-2xl">🥥</Text>
      <Pressable onPress={onSettingsPress} hitSlop={12} className="active:opacity-70">
        <Icon as={Settings} size={24} className="text-muted-foreground" />
      </Pressable>
    </View>
  );
}
