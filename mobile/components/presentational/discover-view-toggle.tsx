import { View, Pressable } from 'react-native';
import { List, Map } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/types';

type DiscoverViewToggleProps = {
  value: ViewMode;
  onValueChange: (mode: ViewMode) => void;
};

export function DiscoverViewToggle({ value, onValueChange }: DiscoverViewToggleProps) {
  return (
    <View className="absolute bottom-20 left-0 right-0 items-center">
      <View className="flex-row rounded-full border border-border bg-card p-1">
        <Pressable
          onPress={() => onValueChange('map')}
          className={cn(
            'items-center justify-center rounded-full px-4 py-1.5',
            value === 'map' && 'bg-primary'
          )}
          accessibilityLabel="Map view"
          accessibilityRole="button">
          <Icon
            as={Map}
            size={16}
            className={value === 'map' ? 'text-primary-foreground' : 'text-foreground'}
          />
        </Pressable>
        <Pressable
          onPress={() => onValueChange('list')}
          className={cn(
            'items-center justify-center rounded-full px-4 py-1.5',
            value === 'list' && 'bg-primary'
          )}
          accessibilityLabel="List view"
          accessibilityRole="button">
          <Icon
            as={List}
            size={16}
            className={value === 'list' ? 'text-primary-foreground' : 'text-foreground'}
          />
        </Pressable>
      </View>
    </View>
  );
}
